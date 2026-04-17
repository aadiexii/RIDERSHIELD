# RiderShield: Phase 3

Phase 3 transitions RiderShield from a functioning prototype into a polished, demonstration-ready platform equipped with core ecosystem integrations and a finalized user experience.

## New Architecture Additions

### 1. The Public Website
We introduced a completely new package, `apps/public-website`, which serves as the public-facing landing and conversion sequence for new drivers. Built using Vite, React, and Tailwind, it hosts:
- A dynamic map integration and coverage visualizer.
- Our comprehensive Documentation portal.
- An AI-powered knowledge bot interface for users.

### 2. Authentication Flow (Firebase)
We integrated Firebase Authentication (Phone verification) into the Worker App to replace our local mock sequences. 

### 3. Payout Infrastructure (RazorpayX Mocking)
The Node.js backend has been upgraded with the Razorpay API structures. When the Orchestration Hub detects a threshold breach (e.g., Heavy Rain), the system calls RazorpayX to automatically route individual UPI payouts to every driver within the localized geofence. Due to Sandbox restrictions during the hackathon, the transaction resolves instantly as 'processed' locally.

### 4. Push Communications (Expo)
We enabled the `expo-notifications` structures within the Worker App and Backend. When parametric triggers occur, the microservice asynchronously pushes alerts directly to worker device tokens.

---

## Proof of Implementation

This section directly maps every claimed feature to its exact code location in the repository. This is provided in response to Phase 2 evaluation feedback noting a gap between README claims and verified code.

| Feature | File | Line |
|---|---|---|
| Fraud Detection Engine (5-signal scoring) | `services/backend/index.js` | 710 |
| Fraud check integrated into CRON auto-trigger | `services/backend/index.js` | 940 |
| Fraud analysis REST endpoint (`POST /fraud/analyze`) | `services/backend/index.js` | 1342 |
| CRON multi-signal auto-disruption detection | `services/backend/index.js` | 800 |
| Signal 1: Real-time Weather (OpenWeatherMap API) | `services/backend/index.js` | 820 |
| Signal 2: Real-time AQI (WAQI API) | `services/backend/index.js` | 847 |
| Signal 3: Curfew / Strike (NewsAPI) | `services/backend/index.js` | 867 |
| ML Payout Model (RandomForest) | `services/ml-service/app.py` | 47 |
| ML Premium Model (GradientBoosting) | `services/ml-service/app.py` | 66 |
| RazorpayX payout initialization | `services/backend/index.js` | 39 |
| RazorpayX payout dispatch | `services/backend/index.js` | 1838 |
| Firebase phone auth verification | `services/backend/index.js` | 18 |
| Hackathon demo bypass (9999999999 / 123456) | `services/backend/index.js` | 1640 |
| Worker app demo bypass UI | `apps/worker-app/app/onboarding/phone.tsx` | 98 |
| Real-time alert polling (Worker App) | `apps/worker-app/app/(tabs)/index.tsx` | 211 |
| Live payout injection (zero reload) | `apps/worker-app/app/(tabs)/index.tsx` | 218 |
| HyperTrack SDK integration (mocked for Expo Go) | `apps/worker-app/services/hypertrack.ts` | 1 |

---

## Evaluating the Repository (Demo Mode)

To allow judges to seamlessly test the architecture without requiring valid Indian phone numbers or real SMS OTP routing delays, a strictly segregated bypass has been built directly into the application layer.

### The Hackathon Bypass
When launching the `worker-app` via Expo Go, evaluators can input the following credentials:
- **Phone Number:** `9999999999`
- **OTP Verification:** `123456`

This bypass securely overrides the Firebase sequence and automatically initializes a `Test Rider` profile on the backend endpoint.

### Evaluating Parametric Simulations
Because we cannot guarantee a severe weather event during evaluation, the architecture allows for manual environmental overriding. 
Once successfully logged into the Worker App using the bypass above, evaluators can navigate into the `Admin Dashboard` Simulation Studio to forcibly trigger severe climate events (e.g., Floods). The backend will instantly propagate the trigger, and judges can witness the real-time, zero-touch parametric claim injection directly on their physical mobile screens without any manual refresh. 

Detailed step-by-step instructions for these processes have been built directly into the Worker App under the "Hackathon Demo Info" section on the Home screen.

---

## Environment Variables

Copy the `.env.example` files to `.env` in each respective service directory and fill in your credentials:

```
services/backend/.env.example        → services/backend/.env
apps/worker-app/.env.example         → apps/worker-app/.env
apps/public-website/.env.example     → apps/public-website/.env
```
