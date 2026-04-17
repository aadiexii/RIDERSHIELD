# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in RiderShield, please do not open a public GitHub issue. Instead, contact the team directly.

## Secrets and Environment Variables

This repository does NOT contain any real credentials, API keys, or database URIs. All sensitive values are managed via environment variables loaded at runtime.

Each service contains a `.env.example` file listing all required variables. Copy this to `.env` and fill in your own values:

- `services/backend/.env.example` — Node.js backend keys (MongoDB, JWT, Weather APIs, Razorpay, Firebase)
- `apps/worker-app/.env.example` — React Native app keys (Backend URL, HyperTrack)
- `apps/public-website/.env.example` — Public website keys (Gemini AI)

None of the `.env` files are committed to version control. They are all listed in `.gitignore`.

## Firebase Configuration

The Firebase client configuration object in `apps/worker-app/config/firebase.ts` is intentionally public-facing. Firebase documentation specifies that the `apiKey` in the client SDK is a project identifier, not a secret. Security is enforced via Firebase Security Rules on the server side.

## Google Services

The `google-services.json` file required for Android Firebase push notifications is excluded from version control via `.gitignore`. Contact the team to obtain this file for local builds.
