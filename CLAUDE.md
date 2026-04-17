# RiderShield — AI-Powered Parametric Insurance for Gig Workers

## Project Overview
RiderShield (formerly GigShield) protects Zomato, Swiggy, and Blinkit delivery workers from income loss caused by external disruptions (rain, flood, heat, AQI, curfew). When disruption hits, workers get paid automatically. Zero touch. No manual claims.

## Monorepo Structure
RiderShield/
  apps/
    admin-dashboard/   # React + Vite + Tailwind (insurance company web dashboard)
    public-website/    # React + Vite + Tailwind (public landing and knowledge base)
    worker-app/        # Expo React Native (delivery worker mobile app)
  services/
    backend/           # Node.js + Express (REST API server)
    ml-service/        # Python + FastAPI (ML payout and premium models)

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Mobile: Expo React Native
- Backend: Node.js + Express + MongoDB
- ML: Python + FastAPI + scikit-learn
- Payments: Razorpay API mock implementation
- Notifications: Expo Push Notifications
- Weather: OpenWeatherMap API
- AQI: WAQI API
- Location: HyperTrack SDK

## Running the Project Locally
- Admin dashboard: cd apps\admin-dashboard && npm run dev (port 5173)
- Public website: cd apps\public-website && npm run dev (port 5174)
- Backend: cd services\backend && node index.js (port 5000)
- ML service: cd services\ml-service && venv\Scripts\activate && uvicorn app:app --port 8000 --reload
- Worker app: cd apps\worker-app && npx expo start

## Key Rules
- Currency is ALWAYS INR using Rs. or the rupee symbol.
- Project name is RiderShield everywhere.
- Do NOT use emojis in documentation or user-facing UI per strict requirements.
- All user-facing text must support Hindi and English toggle where possible.
- Weekly premium uses real ML model, never hardcoded rules.
- Payout formula: earnings_baseline_hourly x hours_affected x severity_score.
- Never use localStorage for real data, always use backend APIs.
- All frontend API calls go to backend port 5000, never directly to ML port 8000.

## ML Models
- Premium Model: GradientBoostingRegressor
- Payout Model: RandomForestRegressor
- Saved at: services/ml-service/models/
- Both trained on synthetic Indian gig worker disruption data.
- Training script: services/ml-service/train.py

## Backend API Endpoints (port 5000)
- POST /simulate-disruption → triggers disruption, calls ML, triggers Razorpay mock and Push Notifications.
- POST /weather/check → fetches real weather for a city from OpenWeatherMap
- POST /auth/register → register worker or admin
- POST /auth/login → login and return JWT token
- GET /claims → get all claims from MongoDB
- POST /premium/calculate → calculate weekly premium via ML model
- POST /worker/hypertrack-device → bind HyperTrack ID to driver

## Environment Variables (services/backend/.env)
- PORT=5000
- ML_SERVICE_URL=http://localhost:8000
- OPENWEATHER_API_KEY=your_key_here
- JWT_SECRET=ridershield_secret_2026
- MONGODB_URI=your_mongo_uri_here

## Disruption Types and Thresholds
- rain: rainfall greater than 50mm in 3 hours
- flood: official flood alert issued
- heatwave: temperature greater than 45 degrees C
- smog: AQI greater than 400
- curfew: official order detected in zone
- strike: zone blocked more than 4 hours

## Coding Style
- Use async/await always, never chained promises unless forced by a specific dependency mapping.
- Functional React components only, no class components.
- Tailwind only for styling, no inline styles unless absolutely necessary for dynamic layout positioning.
- Every API call must have loading state and error state.
- Keep components small, one responsibility per component.
- Use meaningful variable names, no single letters except loop counters.

## Phase 3 Status
Features built and integrated:
- Firebase Authentication for real SMS routing (with 9999999999 Hackathon mock bypass).
- RazorpayX API mappings on the Node.js backend.
- Expo Push Notifications for localized alert routing.
- HyperTrack SDK mocked local integration.
- Public Website repository complete.
- In-App "Guide" logic added for end-to-end Hackathon demo evaluation.

All five services map to local configurations properly and are ready for formal deployment.