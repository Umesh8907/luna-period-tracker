# Security and AI Guardrails

## Privacy baseline

- Treat menstrual and symptom data as highly sensitive
- Encrypt data in transit and at rest
- Use secure local storage for tokens and secrets
- Minimize retention and support account deletion/export
- Separate product analytics from health content whenever possible

## AI rules

- Do not diagnose conditions
- Do not present AI outputs as medical certainty
- Always disclose uncertainty for predictions
- Escalate users toward clinical help when severe or unusual symptoms are reported
- Log prompt, model, and policy versions for safety review

## Product guardrails

- Require explicit consent before enabling personalized insights
- Make AI features optional and reversible
- Provide a visible "Why am I seeing this?" explanation for every insight
- Add emergency and urgent-care messaging for severe pain, fainting, or unusually heavy bleeding

## Engineering checklist

- Authentication and authorization
- Encrypted storage strategy
- Secrets management
- Rate limiting and abuse controls
- Audit logging for health-data access
- Backup and restore strategy
- CI/CD with release approvals
- Crash reporting and alerting
- Unit, integration, and end-to-end tests

## Important note

This app can be wellness-supportive without acting as a medical device. Before making diagnostic claims, treatment guidance, or clinician-directed automation, review the regulatory and legal implications with qualified counsel in your target markets.
