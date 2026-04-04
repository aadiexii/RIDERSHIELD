# RiderShield Phase 2 Complete: Beyond Basic Parametric Insurance

Welcome to Phase 2 of RiderShield. We are aware that many hacks address gig worker insurance by simply hooking an OpenWeather API to a payout script. RiderShield is different. 

While our core concept uses parametric data, we spent Phase 2 building the **opinionated, edge-case infrastructure** required to deploy this in the real world—specifically in India. A weather API cannot detect a sudden local strike, it cannot prove a worker's historical income, and it cannot stop coordinated GPS-spoofing fraud rings. **We built systems that can.**

You can read this document to fully understand our unique backend architecture, our live ML pipelines, and our crowdsourced safety systems. We have also attached an Android APK for the delivery app, and our enterprise web dashboard is fully deployed and live.

---

## ⚡ Our "Unexpected" Engineering Differentiators

This is not a boilerplate application. We purpose-built three massive differentiators to solve the actual problems of gig-worker insurance at scale:

### 1. "Safety Mode" — A Crowdsourced Mesh Network
APIs do not cover everything. If a sudden local bandh (strike) or a severe road blockade occurs in Gurugram, no weather API will trigger a payout, but workers still lose income. 
We built **Safety Mode**: a physical button in the worker app. If one worker presses it, nothing happens. But if **3 workers in the exact same zone press it within 30 minutes**, our backend registers a "Group Signal". It immediately cross-references local city data via NewsAPI for keywords like "curfew" or "protest". If corroborated, it overrides the standard system and authorizes emergency payouts. **We built a human-centric disruption tracker for unmapped events.**

### 2. Setu Account Aggregator Integration (Income Baseline)
Most parametric platforms guess a flat payout amount. We engineered our backend to integrate with the RBI's **Account Aggregator framework**. Instead of taking Zomato's word for it, RiderShield will securely read the worker's official bank statement, scan for "ZOMATO PVT LTD" or "BUNDL TECHNOLOGIES" credits, and mathematically establish a highly accurate "Earnings Baseline". Our Python ML engine then uses this exact baseline to calculate personalized premiums. 

### 3. A 5-Layer ML Fraud Detection Engine
You cannot offer automatic payouts without enterprise-grade security. Our backend intercepts every single disruption trigger (even automated weather ones) and runs a rigorous 5-layer fraud check before authorizing a Razorpay UPI transfer:
1. **Claim Velocity**: Is this zone suddenly generating 50 claims in 5 minutes? (Flags coordinated rings).
2. **GPS Cluster Analysis**: Do the GPS coordinates match the disrupted zone?
3. **Time Profiling**: Did the disruption happen during the worker's usual delivery hours?
4. **Device Fingerprinting**: Is this claim coming from a known, non-emulated device?
5. **Trust Score Gate**: Does the worker have a high enough behavioral historical score?

*Only if the engine returns a High Confidence Score does the payout execute automatically. Otherwise, it is diverted to the Admin Dashboard for manual review.*

---

## 🏗️ The Deployment Architecture

To host this complex pipeline, we utilized a modern, serverless cloud architecture.

1. **The Machine Learning Engine (Python/FastAPI):** Deployed on **Render.com**. We chose Render because it easily containerizes our heavy data-science workloads (scikit-learn, pandas). It hosts our pre-trained `.pkl` models and exposes our FastAPI server 24/7.
2. **The Backend Central API (Node.js/Express):** Also deployed on **Render.com**. This acts as the grand orchestrator, managing Mongo Atlas databases, executing the 15-minute disruption-detection Cron jobs, and pushing real-time alerts.
3. **The Web Dashboard (React/Vite):** Deployed on **Vercel**. It houses the public marketing site and the secure, JWT-authenticated Admin Control Center.
4. **The Mobile Application (React Native/Expo):** We utilized **EAS (Expo Application Services)** to compile our source code into the standalone Android `.apk` file attached to this submission.

---

## 🧠 Service Deep Dives

### The Python ML Engine (`app.py` & `train.py`)
Our ML engine runs two distinct, trained algorithms:
*   **The Premium Model (Gradient Boosting Regressor):** Trained on 1000 data points across 9 features (Trust Scores, 7-day Weather Forecasts, Zone Risk). It builds hundreds of decision trees to output a highly personalized weekly premium (Rs. 30 - 200).
*   **The Payout Model (Random Forest Regressor):** Calculates the exact fraction of income loss based on disruption severity, hours affected, and the worker's earnings baseline.

### The Backend Router (`index.js`)
*   **The Disruption Cron:** Every 15 minutes, the Node server independently pings the OpenWeather API, WAQI (for severe pollution/smog), and NewsAPI across all 6 of our monitored zones. 
*   **`/simulate-disruption`:** The engine you can use right now on our live dashboard to manually trigger a fake storm, watch the Fraud Engine run, and see the ML model calculate a dynamic payout in real-time.
*   **`/premium/breakdown`:** An endpoint that returns a highly itemized math receipt showing *why* a premium costs what it does (e.g. +Rs. 15 for bad weather forecast, -Rs. 10 for a high trust score).

### The Web Dashboard & Worker APK
*   **The Control Center (Web):** Allows platform admins to review mathematically flagged claims in a queue, view live analytics, and monitor environmental API health globally.
*   **The Worker App (Mobile):** Polling the backend every 10 seconds, this app runs silently until an API threshold is breached. It then flashes a massive success notification showing the exact Rupee amount pushed to their UPI. It also houses the vital "Safety Mode" button.

---

## ⚠️ Our Intentional Mock Data Strategy

During a hackathon evaluation, we want judges to immediately experience the platform. We did not want you to have to wait for it to actually flood in Delhi just to see our UI respond.

**What is Real code:** 
The Machine Learning math, the Node.js routing, the UI state management, the 15-minute Cron architecture, the 5-layer Fraud Engine algorithms, the JWT/Google Sign-In logic, and the cloud infrastructure.

**What is Seeded (Mocked) data:**
Every worker name in the database, the historical claims ledger, the active fraud alerts on the dashboard, and the mobile validation screens (Aadhaar/OTP are bypassed). 

This purposeful design choice allows you to click through the applications and watch the ML premium calculator update dynamically in real-time without the friction of a blank database.

---

## 🚀 Moving Towards Phase 3

Phase 2 successfully proved our custom logic works end-to-end. As we move into Phase 3, we are not changing the architecture; we are simply swapping our mocked data layers with live vendor SDKs:
1. Connecting the **Setu Account Aggregator API** to fetch live banking transaction baselines.
2. Integrating the **RazorpayX API** to convert our simulated success notifications into real, finalized UPI deposits.
3. Injecting the **HyperTrack SDK** into the React Native app for real-time, untamperable GPS verification leading up to a claim.
