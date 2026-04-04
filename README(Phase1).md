# RiderShield Phase 1 Complete

AI-Powered Parametric Insurance Platform for India's Gig Delivery Workers

RiderShield protects food delivery partners (Zomato, Swiggy) from income loss caused by external disruptions like extreme weather, floods, pollution, and curfews. When a disruption hits, workers get paid automatically. No forms. No calls. No waiting.

---

## The Problem

India has over 10 million gig delivery workers. When extreme rain, floods, curfews, or pollution hit their zone, they cannot work. They lose 20 to 30 percent of their monthly income with zero protection. No insurance product exists for them today.

RiderShield fixes this.

---

## Persona

We focus exclusively on Food Delivery Partners working on Zomato and Swiggy in India.

| Attribute | Details |
|---|---|
| Platforms | Zomato, Swiggy |
| Device | Budget Android phones (Redmi, Realme, Infinix) in the Rs. 5,000 to 10,000 range |
| Language | Hindi (primary), English (secondary) |
| Working Hours | 10am to 10pm, peak during lunch and dinner |
| Average Weekly Earnings | Rs. 4,000 to Rs. 7,000 per week |
| Income Loss During Disruption | 20 to 30 percent of monthly income |
| Insurance Awareness | Very low |

### Real Scenario

Rahul is a Swiggy delivery partner in Noida. On a Tuesday afternoon, the IMD issues a heavy rain alert. Rainfall crosses 50mm in 3 hours. Rahul cannot ride. RiderShield detects this automatically, verifies Rahul was online and in the affected zone via HyperTrack, and credits Rs. 320 to his UPI account within minutes. Rahul did nothing except open the app in the morning.

---

## Complete Application Flow

This is the end to end journey every worker goes through on RiderShield.

---

### Step 1: Sign Up and Sign In (Bank Level Security)

The authentication process in RiderShield follows the same strict standards used by Indian banking apps. This is the first line of defense against fraud.

```
Worker downloads RiderShield app
     
Bank level security checks run immediately:
Developer mode detection: app blocks if phone is in developer mode
Root detection: app blocks on rooted phones
Emulator detection: app blocks if running on emulator
Screenshot prevention: sensitive screens cannot be screenshotted
SSL pinning: prevents man in the middle attacks
     
Worker enters mobile number
OTP sent to registered number only
OTP verified
     
Device binding: account is locked to this one device
If login attempted from new device: full re-verification required
```

This level of security ensures that fake accounts, emulated devices, and compromised phones cannot access RiderShield from the very first step.

---

### Step 2: KYC Verification

Once signed up, the worker goes through a full KYC process to confirm they are a real and genuine person.

```
Worker submits Aadhaar number
UIDAI eKYC API verifies Aadhaar in real time
     
Worker submits PAN number
PAN verification confirms identity
     
Live face match performed
Worker takes a live selfie
AI compares selfie with Aadhaar photo
Match confirmed: KYC passed
No match: KYC failed, account blocked
     
Output:
{
  "kycStatus": "verified",
  "kycScore": 0.95,
  "identityConfirmed": true
}
```

APIs used: Digio or Karza Technologies for Aadhaar, PAN, and face match verification.

---

### Step 3: Gig Worker Verification via Account Aggregator

After KYC, we verify that the person is a genuine and active gig delivery worker. We do this using the RBI regulated Account Aggregator framework via Setu.

```
Worker gives consent on app to share bank data
Setu Account Aggregator fetches bank transaction history
     
We scan for regular credits from:
Zomato India Pvt Ltd
Bundl Technologies Pvt Ltd (Swiggy)
     
We analyse:
Frequency of credits (weekly payouts = active worker)
Average weekly income over last 4 weeks
Consistency of earnings
     
Output:
{
  "isGigWorker": true,
  "confidenceScore": 0.91,
  "platformsDetected": ["Swiggy"],
  "weeklyAverageIncome": 5400,
  "lastActiveDays": 2,
  "earningsBaseline": 5400
}
```

This step solves our biggest challenge. We cannot access Zomato or Swiggy's private order data directly. But every time they pay a worker, it shows as a bank credit. The Account Aggregator gives us this data with the worker's consent. No Zomato or Swiggy API needed.

The earnings baseline extracted here becomes the primary input for the ML payout model in Step 5.

---

### Step 4: Policy Creation and Weekly Premium

Once verified, the worker selects a coverage plan. The ML model immediately calculates their personalised weekly premium.

```
Worker selects plan: Basic, Standard, or Premium
     
ML model runs with these inputs:
Zone Risk Score: how often disruptions happen in worker's zone
Earnings Baseline: from Setu Account Aggregator data
Upcoming Weather Forecast: next 7 days for worker's zone
Worker Trust Score: starts at 50 for new workers
Historical Claim Rate: claims filed in that zone in last 3 months
Coverage Plan: Basic, Standard, or Premium
     
ML model outputs personalised weekly premium
     
Worker reviews policy with clear thresholds in Hindi
Worker sets up UPI AutoPay for weekly premium deduction
Coverage activates from Monday 00:00 to Sunday 23:59
```

#### Coverage Plans

| Plan | Base Weekly Premium | Max Weekly Payout | Coverage Hours |
|---|---|---|---|
| Basic | Rs. 49/week | Rs. 500/week | 6 hours/day |
| Standard | Rs. 79/week | Rs. 900/week | 8 hours/day |
| Premium | Rs. 119/week | Rs. 1,500/week | 12 hours/day |

Base premiums are adjusted up or down by the ML model based on inputs. A worker in a flood prone zone with heavy rain forecast next week may pay Rs. 94 for Standard. A worker in a historically safe zone with clear weather may pay Rs. 67 for the same plan.

---

### Step 5: Dynamic ML Payout Model

This is the core of RiderShield. We do not use fixed payout amounts. The ML model is trained on multiple real world disruption scenarios and calculates the right payout amount for each worker automatically.

#### How the Model is Trained

We feed the model historical disruption scenarios:

```
Scenario 1:
Zone: Noida Sector 18
Disruption: Heavy Rain, 62mm in 3 hours
Worker earnings baseline: Rs. 5,400/week
Hours affected: 4
Payout given: Rs. 340

Scenario 2:
Zone: Delhi Saket
Disruption: AQI 420, Severe pollution
Worker earnings baseline: Rs. 4,800/week
Hours affected: 6
Payout given: Rs. 410

Scenario 3:
Zone: Gurugram Sector 56
Disruption: Curfew, zone blocked 5 hours
Worker earnings baseline: Rs. 6,200/week
Hours affected: 5
Payout given: Rs. 520

... hundreds of such scenarios
```

The model learns the relationship between disruption severity, worker earnings, hours affected, and the right payout amount.

#### When a New Disruption Hits

```
Disruption detected in Zone X
     
Model receives:
Worker's earnings baseline (from Setu AA)
Disruption type and severity score
Number of hours zone was affected
Worker's coverage plan
     
Model outputs:
{
  "workerId": "W1023",
  "zone": "Noida Sector 18",
  "disruptionType": "heavy_rain",
  "severityScore": 0.87,
  "hoursAffected": 4,
  "earningsBaseline": 5400,
  "payoutAmount": 318,
  "confidence": 0.92
}
```

#### Payout Formula (Simplified)

```
Payout = (Earnings Baseline per hour) x (Hours Affected) x (Severity Score)

Example:
Worker earns Rs. 5,400/week = Rs. 771/day = Rs. 96/hour
Disruption lasted 4 hours
Severity Score: 0.87 (heavy rain, threshold well exceeded)

Payout = 96 x 4 x 0.87 = Rs. 334
```

The ML model refines this formula continuously as more real world claim data comes in. It gets smarter every week.

---

### Step 6: 24/7 Monitoring

Once a worker has an active policy, RiderShield monitors their zone and activity around the clock.

#### Environment Monitoring via APIs

```
Weather API checks every 15 minutes:
Is rainfall exceeding threshold in this worker's zone?
Is temperature exceeding threshold?
Has a flood alert been issued?

AQI API checks every 30 minutes:
Is AQI crossing 400 in this worker's zone?

News API monitors continuously:
Are curfew, bandh, strike, Section 144 keywords
trending for this city or zone?

Traffic API monitors continuously:
Are roads in this zone showing unusual blockage?
```

#### Worker Activity Monitoring via HyperTrack

HyperTrack SDK runs in the background of the worker's app throughout their shift. This is how we confirm a worker was genuinely present and working when a disruption hit.

```
HyperTrack tracks in real time:
Exact GPS location of worker
Speed of movement (confirms delivery activity vs personal travel)
Whether worker is moving or stationary
Time spent in specific delivery zones
Entry and exit from defined zone boundaries
     
What this tells us:
Worker moving at 20 to 40 km/h near restaurants = delivering
Worker stationary for extended period = not working or disruption hit
Worker in Zone X when disruption hit Zone X = valid location
Worker in Zone Y when disruption hit Zone X = invalid claim
```

HyperTrack also includes built-in fake GPS detection. If a worker is using a GPS spoofing app, HyperTrack flags this automatically.

---

### Step 7: Disruption Detection and Worker Verification

When a disruption is detected, we immediately verify the worker was genuinely affected before triggering any claim.

```
API threshold crossed in Zone X
     
Verification checks run:

Check 1: Was worker in Zone X when disruption hit?
HyperTrack GPS confirms location

Check 2: Was worker actively working before disruption?
HyperTrack shows movement and activity before event

Check 3: Did worker's activity drop after disruption?
HyperTrack shows worker became stationary or exited zone

Check 4: Was worker's shift active on RiderShield?
Worker must have started shift on app

All checks passed: Claim triggered automatically
Any check failed: Claim flagged for review
```

---

### Step 8: Safety Mode (For Undetectable Disruptions)

Safety Mode is a worker-initiated feature for disruptions that APIs cannot automatically detect, such as sudden curfews or local strikes. It also acts as a fallback when API data is unavailable.

```
Worker activates Safety Mode manually
     
System runs verification:
Check 1: News API keyword detection in that zone
Check 2: Traffic API showing blockage in zone
Check 3: Group Signal: 3 or more workers in same zone activated within 30 minutes
Check 4: HyperTrack confirms worker is in affected zone
Check 5: Worker's delivery activity dropped to zero
     
4 to 5 checks pass: Auto approve
2 to 3 checks pass: Flag for admin review
Less than 2: Auto reject with reason
```

Group Signal is our most powerful fraud check here. Twenty workers in the same zone all activating Safety Mode within 30 minutes is nearly impossible to fake.

Safety Mode activations per week are governed by the worker's Trust Score:

| Trust Score | Safety Mode Activations Per Week |
|---|---|
| 80 and above | 3 activations |
| 50 to 79 | 2 activations |
| Below 50 | 1 activation with mandatory review |

---

### Step 9: Fraud Check and Confidence Scoring

Every claim, whether auto-triggered or Safety Mode, goes through a full AI fraud check before payout.

```
Fraud checks run:
Device fingerprint matches registered device?
Face verification matches registered face?
GPS data is genuine, not spoofed?
Worker was not already paid for this disruption event?
Claim pattern looks normal for this worker?
Multiple accounts from same device?
     
AI generates Confidence Score (0 to 100)
```

| Confidence Score | Action |
|---|---|
| 80 to 100 | Auto approve and instant payout |
| 50 to 79 | Flag for admin review within 2 hours |
| Below 50 | Auto reject, worker notified with reason in Hindi |

---

### Step 10: Payout

```
ML model calculates exact payout amount
Confidence Score confirms claim is genuine
Razorpay processes instant UPI payout to worker's registered account
     
Worker receives Hindi push notification:
"Aapka claim approve ho gaya. Rs. 318 aapke account mein aa gaye."
     
Claim recorded in worker's app history
Admin dashboard updated in real time
```

---

## Disruptions Covered and Thresholds

| Disruption | Type | Threshold | Data Source |
|---|---|---|---|
| Heavy Rain | Environmental | Rainfall greater than 50mm in 3 hours | OpenWeatherMap |
| Flood | Environmental | Official flood alert issued for zone | NDMA and IMD API |
| Extreme Heat | Environmental | Temperature greater than 45 degrees C for 4 or more hours | OpenWeatherMap |
| Severe Pollution | Environmental | AQI greater than 400 | WAQI API |
| Curfew or Section 144 | Social | Official order detected in zone | News API plus Traffic API plus Group Signal |
| Local Strike or Bandh | Social | Zone blocked for more than 4 hours | Traffic API plus Group Signal |
| Restaurant Zone Closure | Social | 70 percent or more restaurants closed in zone | Platform API (simulated) |

The ML model adjusts thresholds per zone based on historical data. A zone that floods at 30mm gets its threshold lowered from 50mm to 30mm automatically.

---

## Three Tier Identity Verification

To prevent account sharing fraud, the app uses device-level biometric verification at login and at claim time. The app detects what the device supports and uses the strongest available method automatically.

| Tier | Method | When Used |
|---|---|---|
| Tier 1 | Fingerprint | Device has fingerprint sensor |
| Tier 2 | Face Verification via AI | No fingerprint, has front camera |
| Tier 3 | OTP on registered number | No fingerprint, no camera |

Over 90 percent of budget Android phones sold in India include fingerprint sensors or front cameras. Effectively all workers are covered by Tier 1 or Tier 2.

---

## Hindi Language Support

RiderShield launches with full Hindi language support. All screens, buttons, policy terms, notifications, and claim updates are available in simple Hindi. This removes the single biggest adoption barrier for gig insurance in North India.

Future phases will add Tamil, Telugu, Kannada, and Bengali.

---

## Adversarial Defense and Anti-Spoofing Strategy

This section addresses a coordinated fraud ring scenario where hundreds of workers simultaneously submit fake GPS claims to drain the insurance liquidity pool.

### How We Detect a Fraud Ring

**Claim Velocity Anomaly**
A sudden spike of 50 or more claims from the same zone within 5 minutes is statistically impossible in genuine scenarios. This triggers an immediate zone-level review and pauses auto-approvals for that zone.

**GPS Cluster Analysis**
In a genuine disruption workers are spread across a zone at different locations. In a fraud ring GPS coordinates cluster unnaturally because spoofers use the same fake coordinates. We run a density clustering algorithm on incoming claim coordinates. Unnatural clustering triggers automatic rejection of the entire cluster.

**Device Fingerprint Cross Matching**
In a fraud ring many fake claims come from the same physical device running multiple emulated accounts. We cross match device IDs across all simultaneous claims and flag all claims from matching device signatures instantly.

**Behavioral Baseline Deviation**
Every worker has a behavioral baseline built over time. A worker who has never claimed in 6 months suddenly claiming during a coordinated event is a strong fraud signal. We score each worker against their own personal baseline.

**Account Age and Trust Score Gate**
New accounts with low trust scores cannot trigger automatic payouts regardless of the disruption. They require manual admin review. This makes it very hard for a fraud ring to use freshly created fake accounts.

**Bank Data Cannot Be Faked**
Setu Account Aggregator data comes directly from the banking system. A fraud ring cannot fabricate months of genuine Zomato or Swiggy payment credits in a real bank account. This is our deepest verification layer.

### Protecting Genuine Workers During a Fraud Ring Event

We cannot punish honest workers because bad actors gamed the system. Our solution is a two-queue system:

```
All claims during suspected fraud event enter review queue
     
AI separates into two groups:

Group A: Long standing workers, high trust score,
consistent behavioral history, verified Setu bank data,
GPS data matches genuine disruption zone naturally
Group A: Processed and paid within 30 minutes

Group B: New accounts, low trust score,
GPS cluster anomalies, device fingerprint flags
Group B: Held for manual admin review, resolved within 24 hours
```

### Anti-Spoofing Architecture Summary

| Layer | Method |
|---|---|
| GPS Spoofing | HyperTrack built-in fake GPS detection |
| Location Jumping | Speed impossibility check between location points |
| Emulator Detection | Device fingerprinting flags emulated Android environments |
| Coordinated Ring | Claim velocity monitoring plus GPS cluster analysis |
| Fake Identities | Setu AA bank data confirms real income history |
| Account Sharing | Three tier biometric verification at claim time |
| Developer Mode | App blocks entirely if developer mode is enabled |
| Rooted Phones | App blocks entirely on rooted devices |

The core philosophy: a fraudster can fake GPS. They cannot simultaneously fake GPS, bank transaction history, device fingerprint, behavioral pattern, and biometric verification all at once.

---

## Admin Dashboard

The insurance company admin uses the web dashboard to monitor everything.

| Section | What It Shows |
|---|---|
| Overview | Total active workers, weekly premiums collected, total payouts, current loss ratio |
| Live Disruption Map | Real time map showing active disruptions across all zones |
| Claims Management | All pending, approved, and rejected claims with confidence scores |
| Fraud Control Panel | Flagged workers, GPS anomalies, device mismatches, coordinated ring alerts |
| Weekly P&L Report | Auto generated every Monday showing previous week financials |
| Predictive Analytics | Next week expected claim volume based on weather forecast |
| Zone Management | Mark zones as disrupted manually, adjust zone thresholds |
| Worker Management | All registered workers, trust scores, plan details, verification status |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Worker Mobile App | React Native (Android) |
| Admin Web Dashboard | React.js |
| Backend API | Node.js with Express.js |
| Database | MongoDB with Mongoose |
| ML and AI Service | Python with Flask (microservice) |
| Worker Activity Tracking | HyperTrack SDK |
| KYC Verification | Digio or Karza Technologies |
| Bank Data and Income Verification | Setu Account Aggregator API |
| Weather Data | OpenWeatherMap API (free tier) |
| AQI Data | WAQI API (free tier) |
| Disaster Alerts | NDMA and IMD API |
| News and Curfew Detection | NewsAPI |
| Traffic Data | Google Maps API or TomTom (mock acceptable) |
| Payment Gateway | Razorpay Sandbox |
| Push Notifications | Firebase Cloud Messaging |
| Maps and Geofencing | Google Maps SDK |
| Authentication | JWT with device biometrics |

---

## API Integration Plan

| API | Purpose | Real or Mock |
|---|---|---|
| OpenWeatherMap | Rain, temperature, flood data | Real (free tier) |
| WAQI API | AQI monitoring | Real (free tier) |
| NDMA and IMD | Disaster and flood alerts | Real (free tier) |
| NewsAPI | Curfew and strike keyword detection | Real (free tier) |
| HyperTrack | Worker activity and location tracking | Real (free tier) |
| Setu Account Aggregator | Income verification and earnings baseline | Real (sandbox) |
| Digio or Karza | KYC and Aadhaar verification | Real (sandbox) |
| Google Maps | Geofencing and zone definition | Real (free tier) |
| Traffic API | Road blockage detection | Mock acceptable |
| Razorpay | Premium collection and claim payouts | Sandbox |
| Firebase | Push notifications | Real (free tier) |

---

## Development Plan

### Phase 1: Ideation and Foundation (March 4 to 20)
Research, planning, and documentation. This README is the primary deliverable along with a 2 minute concept video.

### Phase 2: Automation and Protection (March 21 to April 4)
Build core features: worker onboarding with bank level security, KYC integration, Account Aggregator income verification, weekly policy creation, ML premium calculation, parametric trigger engine with 3 to 5 automated disruption triggers, HyperTrack integration, and claims management system. Deliver 2 minute demo video.

### Phase 3: Scale and Optimise (April 5 to 17)
Advanced fraud detection, Razorpay sandbox instant payouts, full dual dashboard for workers and admins, predictive analytics for next week risk, Safety Mode refinement, and final polish. Deliver 5 minute demo video and pitch deck PDF.

---

## What We Are Not Building

RiderShield strictly excludes the following:

- Health insurance
- Accident or injury claims
- Vehicle repair coverage
- Life insurance
- Manual claim filing of any kind
- Freelance marketplace features

---

## Repository

GitHub: https://github.com/aadiexii/RIDERSHIELD

This repository will be used across all three phases of Guidewire DEVTrails 2026.
