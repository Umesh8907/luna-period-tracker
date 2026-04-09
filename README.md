# Luna: AI Period Tracker

Luna is a React Native app foundation for a production-grade AI-assisted period tracker. This starter is intentionally opinionated around privacy, explainable AI, and a clean path from prototype to regulated health-adjacent product.

## Stack

- Expo + React Native + TypeScript
- React Navigation for app structure
- Zustand for lightweight client state
- TanStack Query for server state and syncing
- Zod + React Hook Form for safe inputs

## Product goals

- Fast cycle and symptom logging
- Useful but bounded AI insights
- Privacy-first handling of sensitive health data
- Production-ready architecture that can grow into subscriptions, notifications, and clinician exports

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run start
```

3. Launch a platform target:

```bash
npm run android
npm run ios
```

## Initial app sections

- `Home`: upcoming period window, recent metrics, product behavior preview
- `Log`: recent cycle entries and daily symptom tracking foundation
- `Insights`: deterministic AI insight scaffolding with safety guardrails
- `Settings`: privacy and consent-focused controls

## Next production milestones

- Replace mock state with encrypted local persistence and a backend API
- Add authentication, onboarding, consent, and recovery flows
- Train or integrate an explainable prediction service using longitudinal cycle data
- Add notifications, clinician exports, and subscription entitlements
- Ship analytics, crash reporting, test coverage, and release automation

See the docs folder for the detailed architecture and production guidance.

aHCXHbIjm3TW6cD7