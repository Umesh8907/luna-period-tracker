# Production Architecture

## Recommended product shape

### Client

- Expo/React Native app for iOS and Android
- Offline-first local cache for logging continuity
- Encrypted on-device storage for sensitive profile and cycle data
- Feature flags for staged rollout of AI capabilities

### Backend

- API gateway plus auth service
- Cycle data service for logs, profile, reminders, and exports
- AI insight service for predictions, pattern summaries, and notification timing
- Audit/event service for consent, policy changes, and model-version logging

### Data stores

- Primary relational database for users, profiles, cycles, symptoms, reminders, consent records
- Object storage for exports and clinician-ready PDFs
- Analytics warehouse with de-identified product events only

## Suggested domains

- `auth`: sign in, session, recovery, MFA
- `onboarding`: consent, baseline cycle setup, goals
- `cycle`: daily logs, predictions, history
- `insights`: AI-generated summaries and explainability
- `notifications`: reminder windows, symptom follow-ups
- `settings`: privacy, export, deletion, subscription

## AI system design

### Phase 1

- Start with rules plus statistical forecasting
- Generate predictable explanations from explicit signals like cycle length variance, symptom frequency, and recency
- Keep all outputs assistive and non-diagnostic

### Phase 2

- Add retrieval-backed guidance using vetted health content
- Generate summaries with guardrails and templated response constraints
- Track model version, prompt version, and evidence sources per output

### Phase 3

- Personalize prediction windows and recommendations based on longitudinal behavior
- Add uncertainty calibration, confidence scores, and user-facing explanation cards

## Recommended data model

### Core tables

- `users`
- `profiles`
- `cycle_events`
- `symptom_logs`
- `predictions`
- `consents`
- `notification_preferences`
- `subscription_status`
- `audit_events`

## Shipping priorities

1. Onboarding, consent, logging, and core prediction
2. Notifications, exports, and privacy controls
3. AI summaries with safety review
4. Subscription and growth loops
5. Experimentation platform and clinician partnerships

