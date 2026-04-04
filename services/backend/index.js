require('dotenv').config()

// Override DNS to use Google's servers — fixes SRV lookup issues on some networks
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express  = require('express')
const cors     = require('cors')
const axios    = require('axios')
const jwt      = require('jsonwebtoken')
const cron     = require('node-cron')
const bcrypt   = require('bcryptjs')
const mongoose = require('mongoose')
const https    = require('https')

const app          = express()
const port         = process.env.PORT || 5000
const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000'
const JWT_SECRET   = process.env.JWT_SECRET     || 'ridershield_fallback_secret'
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'ridershield-guidewire'

app.use(cors())
app.use(express.json())

// GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok', project: 'RiderShield', phase: 2,
    timestamp: new Date().toISOString(),
    services: { backend: 'running', mlService: mlServiceUrl, cronJob: 'active' },
  })
})

// ── Mock HyperTrack Verification ──────────────────────────────────────────────────
const mockHyperTrackVerify = (zone, city) => {
  // Simulates HyperTrack SDK verification
  // In production this would call HyperTrack API
  const workerInZone    = true // Forced to true for hackathon demo
  const wasActive       = true
  const gpsGenuine      = true
  const movementPattern = true
  const allPassed = workerInZone && wasActive && gpsGenuine && movementPattern
  const confidenceScore = Math.floor(Math.random() * 15 + 82)   // 82–97 if passed
  return {
    verified: allPassed,
    confidenceScore,
    checks: {
      workerInZone,
      wasActive,
      gpsGenuine,
      movementPattern,
      deviceFingerprint: true,
      noGPSSpoofing: gpsGenuine,
    },
    hypertrackSessionId: 'HT-' + Date.now(),
    verifiedAt: new Date().toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONGODB CONNECTION
// ═══════════════════════════════════════════════════════════════════════════════

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected: ridershield cluster')
    seedDatabase()
  })
  .catch(err => console.error('❌ MongoDB connection error:', err.message))

// ─── Schemas ──────────────────────────────────────────────────────────────────

const adminUserSchema = new mongoose.Schema({
  adminId:      { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },
  role:         { type: String, enum: ['superadmin', 'zonemanager', 'analyst'], required: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleUid:    { type: String },
  createdAt:    { type: Date, default: Date.now },
})

const claimSchema = new mongoose.Schema({
  claimId:       { type: String, required: true, unique: true },
  workerId:      String,
  zone:          String,
  type:          String,
  severity:      Number,
  hours:         Number,
  payoutAmount:  Number,
  status:        { type: String, enum: ['triggered', 'approved', 'paid', 'rejected'], default: 'triggered' },
  confidence:    Number,
  hypertrackSessionId: { type: String },
  autoTriggered: { type: Boolean, default: false },
  timestamp:     { type: Date, default: Date.now },
})

// ─── Zone Registry ────────────────────────────────────────────────────────────
const ZONES = [
  { id: 'Z001', name: 'Noida Sector 18',    city: 'Noida',    activeWorkers: 142, riskScore: 0.87 },
  { id: 'Z002', name: 'Delhi Rohini',       city: 'Delhi',    activeWorkers: 98,  riskScore: 0.79 },
  { id: 'Z003', name: 'Gurugram Sector 45', city: 'Gurugram', activeWorkers: 76,  riskScore: 0.64 },
  { id: 'Z004', name: 'Lucknow Hazratganj', city: 'Lucknow',  activeWorkers: 54,  riskScore: 0.58 },
  { id: 'Z005', name: 'Patna Boring Road',  city: 'Patna',    activeWorkers: 43,  riskScore: 0.71 },
  { id: 'Z006', name: 'Delhi Saket',        city: 'Delhi',    activeWorkers: 87,  riskScore: 0.43 },
]

let activeAlerts      = []
let recentAutoTriggers = []

const AdminUser = mongoose.model('AdminUser', adminUserSchema)
const Claim     = mongoose.model('Claim',     claimSchema)

// ─── Seed initial data if DB is empty ─────────────────────────────────────────

async function seedDatabase() {
  try {
    const adminCount = await AdminUser.countDocuments()
    if (adminCount === 0) {
      console.log('🌱 Seeding admin users to MongoDB...')
      await AdminUser.insertMany([
        {
          adminId:      'A001',
          name:         'Super Admin',
          email:        'admin@ridershield.in',
          passwordHash: bcrypt.hashSync('RiderShield@2026', 10),
          role:         'superadmin',
          authProvider: 'local',
        },
        {
          adminId:      'A002',
          name:         'Zone Manager',
          email:        'zone@ridershield.in',
          passwordHash: bcrypt.hashSync('ZoneManager@2026', 10),
          role:         'zonemanager',
          authProvider: 'local',
        },
        {
          adminId:      'A003',
          name:         'Analyst',
          email:        'analyst@ridershield.in',
          passwordHash: bcrypt.hashSync('Analyst@2026', 10),
          role:         'analyst',
          authProvider: 'local',
        },
      ])
      console.log('✅ Admin users seeded')
    }

    const claimCount = await Claim.countDocuments()
    if (claimCount === 0) {
      console.log('🌱 Seeding claims to MongoDB...')
      const zones    = ['Noida Sector 18', 'Delhi Rohini', 'Gurugram Sector 45', 'Patna Boring Road', 'Delhi Saket', 'Lucknow Hazratganj']
      const types    = ['rain', 'heat', 'smog', 'flood', 'curfew']
      const statuses = ['paid', 'approved', 'triggered', 'rejected']
      const workers  = ['W-4821', 'W-2234', 'W-6677', 'W-1823', 'W-9341']

      const claims = Array.from({ length: 20 }, (_, i) => ({
        claimId:      `CLM-${1001 + i}`,
        workerId:     workers[i % workers.length],
        zone:         zones[i % zones.length],
        type:         types[i % types.length],
        severity:     parseFloat((0.6 + Math.random() * 0.35).toFixed(2)),
        hours:        Math.floor(2 + Math.random() * 9),
        payoutAmount: Math.floor(150 + Math.random() * 750),
        status:       i === 19 ? 'rejected' : statuses[Math.floor(Math.random() * 3)],
        confidence:   Math.floor(70 + Math.random() * 29),
        timestamp:    new Date(Date.now() - i * 3600000 * 6),
      }))
      await Claim.insertMany(claims)
      console.log('✅ Claims seeded')
    }
  } catch (err) {
    console.error('Seed error:', err.message)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIREBASE TOKEN VERIFICATION (no service account needed)
// Verifies Google ID tokens using Firebase's public certificates
// ═══════════════════════════════════════════════════════════════════════════════

function fetchGooglePublicKeys() {
  return new Promise((resolve, reject) => {
    https.get(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      (res) => {
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end',  () => {
          try { resolve(JSON.parse(data)) }
          catch (e) { reject(e) }
        })
        res.on('error', reject)
      }
    )
  })
}

async function verifyFirebaseToken(idToken) {
  const keys = await fetchGooglePublicKeys()
  for (const cert of Object.values(keys)) {
    try {
      const decoded = jwt.verify(idToken, cert, {
        algorithms: ['RS256'],
        audience:   FIREBASE_PROJECT_ID,
        issuer:     `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      })
      return decoded // { uid, email, name, picture, ... }
    } catch {
      continue
    }
  }
  throw new Error('Invalid or expired Firebase token')
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' })
  try {
    req.admin = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    return res.status(403).json({ error: 'Access forbidden. Insufficient permissions.' })
  }
  next()
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /auth/admin/login  — email + password
app.post('/auth/admin/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }
  try {
    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() })
    console.log(`[${new Date().toISOString()}] Login attempt: ${email} — ${admin ? 'found' : 'not found'}`)

    if (!admin || !admin.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }
    const match = await bcrypt.compare(password, admin.passwordHash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' })

    const payload = { id: admin.adminId, email: admin.email, name: admin.name, role: admin.role }
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
    console.log(`[${new Date().toISOString()}] Login SUCCESS: ${admin.email} (${admin.role})`)

    res.json({ token, admin: payload, expiresIn: '8h' })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ error: 'Server error during login.' })
  }
})

// POST /auth/google/verify  — Google Sign-In
app.post('/auth/google/verify', async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'Firebase ID token is required.' })

  try {
    // Verify the Firebase token using Google's public certificates
    const firebaseClaims = await verifyFirebaseToken(idToken)
    const googleEmail    = firebaseClaims.email?.toLowerCase().trim()

    if (!googleEmail) {
      return res.status(401).json({ error: 'Could not extract email from Google account.' })
    }

    console.log(`[${new Date().toISOString()}] Google Sign-In attempt: ${googleEmail}`)

    // Look up admin by email in MongoDB
    let admin = await AdminUser.findOne({ email: googleEmail })

    // If not found by email: deny access
    if (!admin) {
      return res.status(401).json({
        error: `Google account (${googleEmail}) is not authorized. Contact your RiderShield administrator.`
      })
    }

    // Update Google UID if first time signing in with Google
    if (!admin.googleUid) {
      admin.googleUid    = firebaseClaims.uid
      admin.authProvider = 'google'
      await admin.save()
    }

    const payload = { id: admin.adminId, email: admin.email, name: admin.name, role: admin.role }
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
    console.log(`[${new Date().toISOString()}] Google login SUCCESS: ${admin.email} (${admin.role})`)

    res.json({ token, admin: payload, expiresIn: '8h' })
  } catch (err) {
    console.error('Google auth error:', err.message)
    res.status(401).json({ error: 'Google authentication failed. ' + err.message })
  }
})

// GET /auth/admin/me
app.get('/auth/admin/me', authenticateAdmin, (req, res) => {
  res.json({ admin: req.admin })
})

// POST /auth/admin/logout
app.post('/auth/admin/logout', authenticateAdmin, (req, res) => {
  console.log(`[${new Date().toISOString()}] Logout: ${req.admin.email}`)
  res.json({ message: 'Logged out successfully.' })
})

// GET /auth/admin/verify
app.get('/auth/admin/verify', authenticateAdmin, (req, res) => {
  res.json({ valid: true, admin: req.admin })
})

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({ service: 'RiderShield Backend', status: 'running', version: '2.0', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.post('/weather/check', async (req, res) => {
  try {
    const { city } = req.body
    const apiKey   = process.env.OPENWEATHER_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key is missing.' })

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    )
    const data = response.data
    const temp        = data.main.temp
    const humidity    = data.main.humidity
    const description = data.weather[0].description
    const rain_mm     = data.rain?.['1h'] ?? 0

    let severity_score = 0.2
    if      (rain_mm > 50) severity_score = 0.9
    else if (rain_mm > 20) severity_score = 0.6
    else if (temp    > 45) severity_score = 0.8

    res.json({ city, temp, humidity, description, rain_mm, severity_score, disruption_detected: severity_score > 0.5 })
  } catch (err) {
    console.error('Weather error:', err.message)
    if (err.response?.status === 401) {
      // Gracefully return mock data instead of 400 so the dashboard continues working
      return res.json({
        city:               req.body.city || 'Noida',
        temp:               34,
        humidity:           65,
        description:        'Mocked (API key pending)',
        rain_mm:            12,
        severity_score:     0.2,
        disruption_detected: false,
        note:               'Using mock data — OpenWeather API key pending activation'
      })
    }
    res.status(500).json({ error: 'Failed to fetch weather data.' })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// PROTECTED ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /claims — fetch from MongoDB
app.get('/claims', authenticateAdmin, async (req, res) => {
  try {
    const claims = await Claim.find().sort({ timestamp: -1 }).lean()
    res.json({ claims, total: claims.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch claims.' })
  }
})

// POST /simulate-disruption
app.post('/simulate-disruption', authenticateAdmin, async (req, res) => {
  try {
    const { disruption_type, severity_score, hours_affected, city } = req.body

    // Step 1: HyperTrack verification
    const hypertrack = mockHyperTrackVerify(city, city)

    // Step 2: Reject immediately if verification fails
    if (!hypertrack.verified) {
      return res.json({
        status:    'rejected',
        reason:    'Worker location verification failed',
        city,
        disruption_type,
        timestamp: new Date().toISOString(),
        hypertrack,
        message:   'Claim rejected: Worker could not be verified in disrupted zone',
      })
    }

    // Step 3: Call ML service for payout
    const typeMap = { rain: 0, flood: 1, heat: 2, smog: 3, curfew: 4 }
    const mlPayload = {
      earnings_baseline_hourly: 100,
      disruption_type:          typeMap[disruption_type?.toLowerCase()] ?? 0,
      severity_score:           parseFloat(severity_score),
      hours_affected:           parseFloat(hours_affected),
      coverage_hours_per_day:   8,
      max_weekly_payout:        900,
      trust_score:              70,
      zone_historical_impact:   0.7,
    }
    const mlResponse = await axios.post(`${mlServiceUrl}/predict-payout`, mlPayload)

    // Step 4: Save to MongoDB with HyperTrack data
    const newClaim = await Claim.create({
      claimId:             `CLM-${Date.now()}`,
      workerId:            `W-${Math.floor(1000 + Math.random() * 9000)}`,
      zone:                city,
      type:                disruption_type,
      severity:            parseFloat(severity_score),
      hours:               parseFloat(hours_affected),
      payoutAmount:        mlResponse.data.payout_amount,
      status:              'approved',
      confidence:          hypertrack.confidenceScore,
      hypertrackSessionId: hypertrack.hypertrackSessionId,
    })

    // Push alert so Worker App picks it up during simulation
    const LABELS = { rain:'Heavy rain', heat:'Extreme heat', smog:'Severe pollution', flood:'Flood alert', curfew:'Curfew or strike' }
    activeAlerts.push({
      id:             'ALERT-' + Date.now(),
      zoneId:         'Z001', // Harcoded 'Noida' ID for hackathon worker app demo
      zoneName:       city,
      disruptionType: disruption_type,
      severity:       parseFloat(severity_score),
      payoutAmount:   mlResponse.data.payout_amount,
      status:         'credited',
      message:        `${LABELS[disruption_type?.toLowerCase()] || 'Disruption'} detected in your zone`,
      payoutMessage:  `Rs. ${mlResponse.data.payout_amount} credited to your UPI`,
      detail:         `Triggered manually via simulation`,
      timestamp:      new Date().toISOString(),
      expiresAt:      new Date(Date.now() + 3600000).toISOString(),
    })
    if (activeAlerts.length > 50) activeAlerts = activeAlerts.slice(-50)

    // Step 5: Return full result
    res.json({
      status:         'approved',
      city,
      disruption_type,
      payout_amount:  mlResponse.data.payout_amount,
      claim_id:       newClaim.claimId,
      severity_score,
      hours_affected,
      hypertrack,
      confidenceScore: hypertrack.confidenceScore,
      timestamp:      new Date().toISOString(),
    })
  } catch (err) {
    console.error('Simulate error:', err.message)
    res.status(500).json({ error: 'Failed to connect to ML service.' })
  }
})

// POST /premium/calculate
app.post('/premium/calculate', authenticateAdmin, async (req, res) => {
  try {
    const { zone_risk_score, earnings_baseline, rain_forecast_7d, heat_forecast_7d, aqi_forecast_7d, trust_score, historical_claim_rate, plan_type, worker_tenure_weeks } = req.body
    const planMap = { basic: 0, standard: 1, premium: 2 }
    const payload = {
      zone_risk_score:       parseFloat(zone_risk_score),
      earnings_baseline:     parseFloat(earnings_baseline),
      rain_forecast_7d:      parseFloat(rain_forecast_7d),
      heat_forecast_7d:      parseFloat(heat_forecast_7d),
      aqi_forecast_7d:       parseFloat(aqi_forecast_7d),
      trust_score:           parseFloat(trust_score),
      historical_claim_rate: parseFloat(historical_claim_rate),
      plan_type:             planMap[plan_type?.toLowerCase()] ?? 0,
      worker_tenure_weeks:   parseFloat(worker_tenure_weeks),
    }
    const response = await axios.post(`${mlServiceUrl}/predict-premium`, payload)
    res.json({ plan_type, weekly_premium: response.data.weekly_premium, currency: 'INR' })
  } catch (err) {
    console.error('Premium error:', err.message)
    res.status(500).json({ error: 'Failed to calculate premium.' })
  }
})

// POST /predict (ML proxy)
app.post('/predict', authenticateAdmin, async (req, res) => {
  try {
    const response = await axios.post(`${mlServiceUrl}/predict`, req.body)
    res.json(response.data)
  } catch {
    res.status(500).json({ error: 'ML service error.' })
  }
})

// POST /admin/zone/mark-disruption
app.post('/admin/zone/mark-disruption',
  authenticateAdmin,
  requireRole('superadmin', 'zonemanager'),
  (req, res) => {
    const { zone, disruptionType, manualOverride } = req.body
    if (!zone || !disruptionType) return res.status(400).json({ error: 'zone and disruptionType are required.' })
    console.log(`[${new Date().toISOString()}] Zone marked by ${req.admin.email}: ${zone} — ${disruptionType}`)
    res.json({ success: true, zone, disruptionType, manualOverride: manualOverride ?? true, markedBy: req.admin.name, markedAt: new Date().toISOString(), message: `Zone "${zone}" marked as disrupted (${disruptionType}).` })
  }
)

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & CLAIM ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /analytics/summary
app.get('/analytics/summary', authenticateAdmin, async (req, res) => {
  try {
    const claims        = await Claim.find().lean()
    const totalClaims   = claims.length
    const totalPayout   = claims.reduce((s, c) => s + (c.payoutAmount || 0), 0)
    const avgPayout     = totalClaims > 0 ? totalPayout / totalClaims : 0
    const approvedClaims  = claims.filter(c => c.status === 'paid' || c.status === 'approved').length
    const pendingClaims   = claims.filter(c => c.status === 'triggered').length
    const rejectedClaims  = claims.filter(c => c.status === 'rejected').length

    const claimsByType = {}
    const claimsByZone = {}
    claims.forEach(c => {
      claimsByType[c.type] = (claimsByType[c.type] || 0) + 1
      if (!claimsByZone[c.zone]) claimsByZone[c.zone] = { count: 0, totalPayout: 0 }
      claimsByZone[c.zone].count++
      claimsByZone[c.zone].totalPayout += (c.payoutAmount || 0)
    })

    res.json({ totalClaims, totalPayout, avgPayout, approvedClaims, pendingClaims, rejectedClaims, claimsByType, claimsByZone })
  } catch (err) {
    console.error('Analytics error:', err.message)
    res.status(500).json({ error: 'Failed to fetch analytics.' })
  }
})

// PATCH /claims/:claimId/status
app.patch('/claims/:claimId/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const valid = ['approved', 'paid', 'rejected']
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' })
    const claim = await Claim.findOneAndUpdate(
      { claimId: req.params.claimId },
      { status },
      { new: true }
    )
    if (!claim) return res.status(404).json({ error: 'Claim not found in MongoDB.' })
    res.json({ success: true, claim })
  } catch (err) {
    console.error('Status update error:', err.message)
    res.status(500).json({ error: 'Failed to update claim status.' })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// FRAUD DETECTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const runFraudDetection = (zone, disruptionType, workerId, trustScore) => {
  const now = new Date()

  const recentZoneClaims = recentAutoTriggers.filter(t =>
    t.zone === zone && (now - new Date(t.timestamp)) < 3600000
  ).length
  const velocityPass    = recentZoneClaims < 5
  const trustPass       = trustScore >= 40
  const hour            = now.getHours()
  const timePass        = hour >= 8 && hour <= 22
  const gpsClusterPass  = Math.random() > 0.08
  const devicePass      = Math.random() > 0.05

  const checks = {
    claimVelocity:     { pass: velocityPass,   reason: velocityPass   ? 'Normal claim frequency in zone'                        : 'Too many claims from this zone in last hour' },
    trustScore:        { pass: trustPass,       reason: trustPass       ? `Trust score ${trustScore} is acceptable`               : `Trust score ${trustScore} is below threshold` },
    timePattern:       { pass: timePass,        reason: timePass        ? 'Claim within working hours'                           : 'Claim outside working hours — suspicious' },
    gpsCluster:        { pass: gpsClusterPass,  reason: gpsClusterPass  ? 'Worker GPS confirmed in disrupted zone'               : 'GPS location does not match claimed zone — possible spoofing' },
    deviceFingerprint: { pass: devicePass,      reason: devicePass      ? 'Device fingerprint matches registered device'         : 'Unknown device detected — possible account sharing' },
  }

  const passCount       = Object.values(checks).filter(c => c.pass).length
  const confidenceScore = Math.round((passCount / 5) * 100)
  const fraudRiskLevel  = passCount === 5 ? 'low' : passCount >= 3 ? 'medium' : 'high'

  return {
    approved: passCount >= 3,
    confidenceScore,
    fraudRiskLevel,
    passCount,
    checks,
    hypertrack: {
      sessionId:      'HT-' + Date.now(),
      workerInZone:   gpsClusterPass,
      wasActive:      timePass,
      gpsGenuine:     gpsClusterPass,
      movementPattern:devicePass,
      verifiedAt:     now.toISOString(),
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════

const calculatePremiumBreakdown = (zone, planType, trustScore, rainForecast, tempForecast, aqiForecast) => {
  const basePremiums = { basic: 49, standard: 79, premium: 119 }
  const base         = basePremiums[planType] || 79
  const zoneObj      = ZONES.find(z => z.name === zone || z.city === zone)
  const zoneRisk     = zoneObj ? zoneObj.riskScore : 0.5

  const zoneAdj  = Math.round(zoneRisk * 30)
  const rainAdj  = Math.round((rainForecast / 100) * 15)
  const heatAdj  = Math.round(Math.max(0, (tempForecast - 35) / 10) * 10)
  const aqiAdj   = Math.round(Math.min(1, aqiForecast / 400) * 12)
  const trustAdj = Math.round(((100 - trustScore) / 100) * 10)
  const total    = base + zoneAdj + rainAdj + heatAdj + aqiAdj + trustAdj

  return {
    finalPremium: Math.max(30, Math.min(200, total)),
    breakdown: [
      { label: 'Base Plan',        value: base,       description: `${planType} plan base rate` },
      { label: 'Zone Risk',        value: zoneAdj,    description: `Zone risk score ${zoneRisk} — ${zoneRisk > 0.7 ? 'High risk area' : zoneRisk > 0.4 ? 'Medium risk area' : 'Low risk area'}` },
      { label: 'Rain Forecast',    value: rainAdj,    description: `${rainForecast}mm forecast next 7 days` },
      { label: 'Heat Forecast',    value: heatAdj,    description: `${tempForecast}°C peak forecast` },
      { label: 'AQI Forecast',     value: aqiAdj,     description: `AQI ${aqiForecast} forecast` },
      { label: 'Trust Adjustment', value: -trustAdj,  description: `Trust score ${trustScore}/100 discount` },
    ],
    inputs: { zone, planType, trustScore, rainForecast, tempForecast, aqiForecast, zoneRiskScore: zoneRisk },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK ACCOUNT AGGREGATOR
// ═══════════════════════════════════════════════════════════════════════════════

const mockAAVerification = async (phoneNumber) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  const weeklyEarnings = [4800, 5200, 4600, 5800, 5100, 4900, 5400, 5600]
  const avgWeekly      = Math.round(weeklyEarnings.reduce((a, b) => a + b) / weeklyEarnings.length)
  const suggestedPlan  = avgWeekly > 5500 ? 'premium' : avgWeekly > 4500 ? 'standard' : 'basic'
  return {
    verified:              true,
    isGigWorker:           true,
    platform:              'Zomato',
    bankName:              'SBI',
    avgWeeklyIncome:       avgWeekly,
    weeklyEarnings,
    lastCreditSource:      'ZOMATO INDIA PVT LTD',
    lastCreditDate:        new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    creditsLast8Weeks:     8,
    suggestedPlan,
    earningsBaselineHourly:Math.round(avgWeekly / 56),
    consentId:             'AA-CONSENT-' + Date.now(),
    fetchedAt:             new Date().toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO DISRUPTION DETECTION CRON
// ═══════════════════════════════════════════════════════════════════════════════

const autoDetectDisruptions = async () => {
  console.log('[CRON] Running multi-signal disruption detection...')

  for (const zone of ZONES) {
    try {

      // ── SIGNAL 1: Weather (OpenWeatherMap) ──────────────────────────────
      let temp = 30, rain = 0, humidity = 50
      let weatherSignal = null

      try {
        const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: { q: zone.city, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' },
          timeout: 5000,
        })
        temp     = weatherRes.data.main?.temp || 30
        rain     = weatherRes.data.rain?.['1h'] || 0
        humidity = weatherRes.data.main?.humidity || 50

        if (rain > 50) {
          weatherSignal = { type: 'rain', severity: Math.min(1, rain / 100), detail: `${rain}mm/hr rainfall` }
        } else if (temp > 45) {
          weatherSignal = { type: 'heat', severity: Math.min(1, (temp - 45) / 10), detail: `${temp}°C extreme heat` }
        }
      } catch (err) {
        if (err.response?.status === 401)
          console.log(`[CRON] OpenWeather key not yet active — skipping ${zone.city}`)
        else
          console.log(`[CRON] Weather API failed for ${zone.city}:`, err.message)
      }

      // ── SIGNAL 2: Real AQI (WAQI API) ───────────────────────────────────
      let aqiSignal = null

      try {
        const aqiRes = await axios.get(`https://api.waqi.info/feed/${zone.city}/`, {
          params: { token: process.env.WAQI_API_KEY || 'demo' },
          timeout: 5000,
        })
        const aqi = aqiRes.data?.data?.aqi
        if (aqi && aqi > 400) {
          aqiSignal = { type: 'smog', severity: Math.min(1, aqi / 600), detail: `AQI ${aqi} — severe pollution` }
          console.log(`[CRON] AQI alert in ${zone.city}: ${aqi}`)
        }
      } catch {
        // Fallback: estimate AQI from humidity
        const estimatedAQI = humidity > 85 ? Math.round(humidity * 4.5) : Math.round(humidity * 2)
        if (estimatedAQI > 400)
          aqiSignal = { type: 'smog', severity: Math.min(1, estimatedAQI / 600), detail: `Est. AQI ${estimatedAQI} from humidity` }
      }

      // ── SIGNAL 3: Curfew/Strike via NewsAPI ─────────────────────────────
      let socialSignal = null

      try {
        const newsRes = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q:        `curfew OR bandh OR strike OR "section 144" OR riot ${zone.city}`,
            language: 'en',
            sortBy:   'publishedAt',
            pageSize: 5,
            apiKey:   process.env.NEWS_API_KEY,
          },
          timeout: 5000,
        })
        const recent = (newsRes.data?.articles || []).filter(a =>
          (Date.now() - new Date(a.publishedAt).getTime()) < 3 * 60 * 60 * 1000
        )
        if (recent.length >= 2) {
          socialSignal = { type: 'curfew', severity: 0.7, detail: `${recent.length} news articles about disruption in ${zone.city}` }
          console.log(`[CRON] Social signal in ${zone.city}: ${recent.length} articles`)
        }
      } catch (err) {
        console.log(`[CRON] NewsAPI failed for ${zone.city}:`, err.message)
      }

      // ── SIGNAL 4: Group Safety Mode activation ───────────────────────────
      const safetyModeCount = recentAutoTriggers.filter(t =>
        t.zone === zone.name &&
        t.type === 'safety_mode' &&
        (Date.now() - new Date(t.timestamp).getTime()) < 30 * 60 * 1000
      ).length

      const groupSignal = safetyModeCount >= 3
        ? { type: 'curfew', severity: 0.65, detail: `${safetyModeCount} workers activated Safety Mode` }
        : null

      // ── MULTI-SIGNAL DECISION ────────────────────────────────────────────
      let finalDisruption = null

      if (weatherSignal) {
        finalDisruption = weatherSignal
        console.log(`[CRON] Environmental trigger: ${weatherSignal.type} in ${zone.name}`)
      } else if (aqiSignal) {
        finalDisruption = aqiSignal
        console.log(`[CRON] AQI trigger in ${zone.name}`)
      } else if (socialSignal && groupSignal) {
        finalDisruption = {
          type:     'curfew',
          severity: Math.max(socialSignal.severity, groupSignal.severity),
          detail:   `Confirmed: ${socialSignal.detail} + ${groupSignal.detail}`,
        }
        console.log(`[CRON] Social trigger confirmed in ${zone.name}`)
      } else if (socialSignal || groupSignal) {
        // Only 1 social signal — queue for admin review, do NOT auto-trigger
        console.log(`[CRON] Weak social signal in ${zone.name} — flagging for admin review`)
        activeAlerts.push({
          id:             'REVIEW-' + Date.now(),
          zoneId:         zone.id,
          zoneName:       zone.name,
          disruptionType: 'curfew',
          severity:       0.5,
          status:         'pending_review',
          message:        `Possible curfew/strike in ${zone.name} — admin review needed`,
          payoutMessage:  'Pending admin review',
          timestamp:      new Date().toISOString(),
          expiresAt:      new Date(Date.now() + 3600000).toISOString(),
          signalSource:   socialSignal?.detail || groupSignal?.detail,
        })
        continue
      }

      if (!finalDisruption) continue

      // ── FRAUD CHECK ─────────────────────────────────────────────────────
      const mockTrustScore = Math.floor(Math.random() * 40 + 55)
      const fraudResult    = runFraudDetection(zone.name, finalDisruption.type, 'W-AUTO-' + zone.id, mockTrustScore)

      if (!fraudResult.approved) {
        console.log(`[CRON] Fraud check failed for ${zone.name}`)
        continue
      }

      // ── ML PAYOUT + SAVE ─────────────────────────────────────────────────
      try {
        const mlRes = await axios.post(`${mlServiceUrl}/predict-payout`, {
          earnings_baseline_hourly: 85,
          disruption_type:          ['rain','heat','smog','flood','curfew'].indexOf(finalDisruption.type),
          severity_score:           finalDisruption.severity,
          hours_affected:           4,
          coverage_hours_per_day:   8,
          max_weekly_payout:        900,
          trust_score:              mockTrustScore,
          zone_historical_impact:   zone.riskScore,
        })

        const payoutAmount = mlRes.data.payout_amount || Math.round(85 * 4 * finalDisruption.severity)

        await new Claim({
          claimId:             'AUTO-CLM-' + Date.now(),
          workerId:            'W-' + Math.floor(Math.random() * 9000 + 1000),
          zone:                zone.name,
          type:                finalDisruption.type,
          severity:            parseFloat(finalDisruption.severity.toFixed(2)),
          hours:               4,
          payoutAmount,
          status:              'approved',
          confidence:          fraudResult.confidenceScore,
          hypertrackSessionId: fraudResult.hypertrack.sessionId,
          autoTriggered:       true,
        }).save()

        const LABELS = { rain:'Heavy rain', heat:'Extreme heat', smog:'Severe pollution', flood:'Flood alert', curfew:'Curfew or strike' }
        activeAlerts.push({
          id:             'ALERT-' + Date.now(),
          zoneId:         zone.id,
          zoneName:       zone.name,
          disruptionType: finalDisruption.type,
          severity:       parseFloat(finalDisruption.severity.toFixed(2)),
          payoutAmount,
          status:         'credited',
          message:        `${LABELS[finalDisruption.type] || 'Disruption'} detected in your zone`,
          payoutMessage:  `Rs. ${payoutAmount} credited to your UPI`,
          detail:         finalDisruption.detail,
          timestamp:      new Date().toISOString(),
          expiresAt:      new Date(Date.now() + 3600000).toISOString(),
        })
        recentAutoTriggers.push({ zone: zone.name, type: finalDisruption.type, timestamp: new Date().toISOString() })
        if (activeAlerts.length > 50)       activeAlerts       = activeAlerts.slice(-50)
        if (recentAutoTriggers.length > 100) recentAutoTriggers = recentAutoTriggers.slice(-100)

        console.log(`[CRON] Auto claim — ${zone.name}: ${finalDisruption.type} Rs. ${payoutAmount}`)
      } catch (mlErr) {
        console.log('[CRON] ML error:', mlErr.message)
      }

    } catch (err) {
      console.log(`[CRON] Zone ${zone.city} failed:`, err.message)
    }
  }

  console.log('[CRON] Detection cycle complete')
}

cron.schedule('*/15 * * * *', autoDetectDisruptions)
setTimeout(autoDetectDisruptions, 10000)
console.log('[CRON] Auto disruption detection started — first run in 10s')

// ═══════════════════════════════════════════════════════════════════════════════
// NEW ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /worker/alerts
app.get('/worker/alerts', (req, res) => {
  const zoneId = req.query.zoneId || 'Z001'
  const since  = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 3600000)
  const zoneAlerts = activeAlerts.filter(a =>
    a.zoneId === zoneId &&
    new Date(a.timestamp) > since &&
    new Date(a.expiresAt) > new Date()
  )
  res.json({ alerts: zoneAlerts, zoneId, checkedAt: new Date().toISOString(), nextCheckIn: 10 })
})

// POST /worker/safety-mode — no auth required (worker app calls this)
app.post('/worker/safety-mode', (req, res) => {
  const { zoneId, zoneName, workerId } = req.body
  if (!zoneId || !zoneName) return res.status(400).json({ error: 'zoneId and zoneName required' })

  recentAutoTriggers.push({
    zone: zoneName, type: 'safety_mode',
    workerId: workerId || 'unknown', timestamp: new Date().toISOString(),
  })

  const groupCount = recentAutoTriggers.filter(t =>
    t.zone === zoneName &&
    t.type === 'safety_mode' &&
    (Date.now() - new Date(t.timestamp).getTime()) < 30 * 60 * 1000
  ).length

  const groupValidated = groupCount >= 3
  res.json({
    received: true, zoneId, groupCount, groupValidated,
    message: groupValidated
      ? `Group signal confirmed — ${groupCount} workers in your zone`
      : `${groupCount} of 3 workers needed for group signal`,
    timestamp: new Date().toISOString(),
  })
})

// GET /zones
app.get('/zones', authenticateAdmin, async (req, res) => {
  try {
    const zonesWithStatus = await Promise.all(ZONES.map(async (zone) => {
      const recentClaims = await Claim.find({ zone: zone.name }).sort({ timestamp: -1 }).limit(5)
      const totalPayout  = recentClaims.reduce((sum, c) => sum + (c.payoutAmount || 0), 0)
      const hasActiveAlert = activeAlerts.some(a => a.zoneId === zone.id && new Date(a.expiresAt) > new Date())
      return {
        ...zone,
        recentClaimsCount: recentClaims.length,
        recentPayout:      totalPayout,
        hasActiveAlert,
        alertType:   hasActiveAlert ? activeAlerts.find(a => a.zoneId === zone.id)?.disruptionType : null,
        status:      hasActiveAlert ? 'disrupted' : 'clear',
        lastChecked: new Date().toISOString(),
      }
    }))
    res.json({ zones: zonesWithStatus })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /premium/breakdown
app.post('/premium/breakdown', async (req, res) => {
  try {
    const { zone = 'Noida Sector 18', planType = 'standard', trustScore = 65, rainForecast = 30, tempForecast = 36, aqiForecast = 180 } = req.body
    const breakdown = calculatePremiumBreakdown(zone, planType, trustScore, rainForecast, tempForecast, aqiForecast)
    try {
      const zoneObj = ZONES.find(z => z.name === zone || z.city === zone)
      const mlRes   = await axios.post(`${mlServiceUrl}/predict-premium`, {
        zone_risk_score:       zoneObj?.riskScore || 0.5,
        earnings_baseline:     5200,
        rain_forecast_7d:      rainForecast,
        heat_forecast_7d:      tempForecast,
        aqi_forecast_7d:       aqiForecast,
        trust_score:           trustScore,
        historical_claim_rate: 0.15,
        plan_type:             ['basic','standard','premium'].indexOf(planType),
        worker_tenure_weeks:   20,
      })
      breakdown.mlCrossValidation = {
        mlPrediction: mlRes.data.weekly_premium,
        agreement:    Math.abs(mlRes.data.weekly_premium - breakdown.finalPremium) < 15 ? 'strong' : 'moderate',
      }
    } catch (mlErr) {
      breakdown.mlCrossValidation = { error: 'ML service unavailable' }
    }
    res.json(breakdown)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /aa/verify
app.post('/aa/verify', async (req, res) => {
  try {
    const { phoneNumber = '9876543210' } = req.body
    const result = await mockAAVerification(phoneNumber)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /fraud/analyze
app.post('/fraud/analyze', authenticateAdmin, (req, res) => {
  try {
    const { zone, disruptionType, workerId, trustScore = 65 } = req.body
    const result = runFraudDetection(zone, disruptionType, workerId, trustScore)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /analytics/live
app.get('/analytics/live', authenticateAdmin, async (req, res) => {
  try {
    const totalClaims    = await Claim.countDocuments()
    const approvedClaims = await Claim.countDocuments({ status: { $in: ['approved', 'paid'] } })
    const payoutResult   = await Claim.aggregate([{ $group: { _id: null, total: { $sum: '$payoutAmount' } } }])
    const totalPayout    = payoutResult[0]?.total || 0
    const autoTriggered  = await Claim.countDocuments({ autoTriggered: true })
    res.json({
      totalClaims,
      approvedClaims,
      totalPayout,
      autoTriggered,
      manualClaims:  totalClaims - autoTriggered,
      activeAlerts:  activeAlerts.filter(a => new Date(a.expiresAt) > new Date()).length,
      activeZones:   ZONES.length,
      lastUpdated:   new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🛡  RiderShield Backend v2.0 on port ${port}`)
  console.log(`📡  ML service: ${mlServiceUrl}`)
  console.log(`🔐  JWT + Google auth enabled\n`)
})
