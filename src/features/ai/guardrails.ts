import { AIInsight } from "../cycle/types";

export function withMedicalGuardrails(insights: AIInsight[]): AIInsight[] {
  return [
    ...insights,
    {
      id: "guardrail-1",
      title: "AI guidance has limits",
      summary:
        "This app can highlight patterns, but it should not diagnose conditions or replace licensed medical advice. Urgent symptoms should trigger clinical escalation.",
      confidence: "high",
      type: "guardrail"
    }
  ];
}

