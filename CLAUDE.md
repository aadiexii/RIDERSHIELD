# GigShield — AI-Powered Parametric Insurance for Gig Workers

## Project Overview
GigShield protects Zomato/Swiggy delivery workers from income loss caused by
external disruptions (rain, flood, heat, AQI, curfew). When disruption hits,
workers get paid automatically. Zero touch. No manual claims.

## Monorepo Structure
GigShield/
  apps/
    admin-dashboard/   # React + Vite + Tailwind (insurance company web dashboard)
    worker-app/        # Expo React Native (delivery worker mobile app)
  services/
    backend/           # Node.js + Express (REST API server)
    ml-service/        # Python + FastAPI (ML payout and premium models)
  shared/              # Shared types and constants

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Mobile: Expo React Native
- Backend: Node.js + Express + MongoDB
- ML: Python + FastAPI + scikit-learn
- Payments: Razorpay sandbox
- Weather: OpenWeatherMap API
- AQI: WAQI API
- Location: HyperTrack SDK (Phase 3)

## Running the Project
- Admin dashboard: cd apps/admin-dashboard && npm run dev (port 5173)
- Backend: cd services/backend && node index.js (port 5000)
- ML service: cd services/ml-service && uvicorn app:app --reload (port 8000)
- Worker app: cd apps/worker-app && npx expo start

## Key Rules (Always Follow These)
- Currency is ALWAYS INR using Rs. or the rupee symbol, NEVER $ or USD
- Project name is GigShield everywhere, never KavachAI
- All user-facing text must support Hindi and English toggle
- Weekly premium uses real ML model, never hardcoded rules
- Payout formula: earnings_baseline_hourly x hours_affected x severity_score
- Never use localStorage for real data, always use backend APIs
- All frontend API calls go to backend port 5000, never directly to ML port 8000

## ML Models
- Premium Model: GradientBoostingRegressor
- Payout Model: RandomForestRegressor
- Saved at: services/ml-service/models/
- Both trained on synthetic Indian gig worker disruption data
- Training script: services/ml-service/train.py

## Backend API Endpoints (port 5000)
- POST /simulate-disruption → triggers disruption, calls ML, returns claim
- POST /weather/check → fetches real weather for a city from OpenWeatherMap
- POST /auth/register → register worker or admin
- POST /auth/login → login and return JWT token
- GET /claims → get all claims from MongoDB
- POST /premium/calculate → calculate weekly premium via ML model

## Environment Variables (services/backend/.env)
- PORT=5000
- ML_SERVICE_URL=http://localhost:8000
- OPENWEATHER_API_KEY=your_key_here
- JWT_SECRET=gigshield_secret_2026
- MONGODB_URI=your_mongo_uri_here

## ML Service API Endpoints (port 8000)
- POST /predict-payout → calculate payout amount for a disruption
- POST /predict-premium → calculate weekly premium for a worker
- GET /health → check if ML service is running

## Disruption Types and Thresholds
- rain: rainfall greater than 50mm in 3 hours
- flood: official flood alert issued
- heatwave: temperature greater than 45 degrees C
- smog: AQI greater than 400
- curfew: official order detected in zone
- strike: zone blocked more than 4 hours

## Coding Style
- Use async/await always, never .then() chains
- Functional React components only, no class components
- Tailwind only for styling, no inline styles
- Every API call must have loading state and error state
- Keep components small, one responsibility per component
- Use meaningful variable names, no single letters except loop counters

## Phase 2 Status (April 3, 2026)
All core features built. See implementation summary below.

### All Running Services
- Admin dashboard: npm run dev in apps/admin-dashboard (port 5173)
- Backend: node index.js in services/backend (port 5000)
- ML service: uvicorn app:app --reload in services/ml-service (port 8000)
- Worker app: npx expo start in apps/worker-app

### New Endpoints Added in Phase 2
- GET  /health                 — backend status check
- GET  /worker/alerts          — worker app polls for live disruption alerts
- POST /worker/safety-mode     — registers safety mode activation
- GET  /zones                  — live zone status with risk scores
- POST /premium/breakdown      — ML premium with full reasoning
- POST /aa/verify              — mock Account Aggregator verification
- POST /fraud/analyze          — on-demand fraud detection
- GET  /analytics/live         — live counts from MongoDB
- PATCH /claims/:id/status     — update claim status

### Disruption Detection (Multi-Signal)
Environmental: OpenWeatherMap (rain/heat) + WAQI AQI — 1 signal sufficient
Social: NewsAPI curfew/strike + Group Safety Mode — 2 signals required
Fallback: Admin manual override via dashboard
Weak social signals (1 signal only): queued as pending_review for admin