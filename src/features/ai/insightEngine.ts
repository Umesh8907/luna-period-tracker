import { daysBetween, formatLongDate } from "../../lib/date";
import { CycleEntry, AIInsight, UserProfile } from "../cycle/types";
import { withMedicalGuardrails } from "./guardrails";
import { predictNextCycle } from "./predictionModel";

export function buildInsights(profile: UserProfile, entries: CycleEntry[]): AIInsight[] {
  const prediction = predictNextCycle(profile, entries);
  const today = new Date().toISOString().slice(0, 10);
  const daysUntilNextPeriod = daysBetween(today, prediction.nextPeriodDate);

  const lowEnergyDays = entries.filter((entry) => entry.symptoms.energy === "low").length;
  const heavyFlowDays = entries.filter((entry) => entry.symptoms.flow === "heavy").length;

  const insights: AIInsight[] = [
    {
      id: "prediction-1",
      title: "Cycle Projection",
      summary: `Your next cycle is projected to start on ${formatLongDate(prediction.nextPeriodDate)}. This prediction is based on ${entries.length > 0 ? "your recent logs" : "your profile defaults"}.`,
      confidence: entries.length >= 3 ? "high" : "medium",
      type: "prediction"
    },
    {
      id: "ovulation-1",
      title: "Fertility Window",
      summary: `Your estimated fertile window is from ${formatLongDate(prediction.fertileWindowStart)} to ${formatLongDate(prediction.fertileWindowEnd)}, with ovulation predicted around ${formatLongDate(prediction.ovulationDate)}.`,
      confidence: "medium",
      type: "prediction"
    },
    {
      id: "pattern-1",
      title: "Energy & Rhythm",
      summary:
        lowEnergyDays > 1
          ? "We noticed a pattern of lower energy near your cycle start. Consider scheduling lighter workouts or more rest during those days."
          : "Your energy levels appear stable based on recent logs. Keep tracking to see how your rhythm evolves with your cycle.",
      confidence: "medium",
      type: "pattern"
    }
  ];

  if (prediction.isIrregular) {
    insights.push({
      id: "irregularity-1",
      title: "Cycle Variability",
      summary: "Your recent cycles show some variability. This is common, but tracking factors like stress or sleep might help the AI identify triggers.",
      confidence: "medium",
      type: "wellness"
    });
  }

  if (heavyFlowDays > 0) {
    insights.push({
      id: "wellness-1",
      title: "Symptom Insight",
      summary: "Heavy flow was logged recently. If this is unusual for you, or happens frequently, it might be worth mentioning to a healthcare provider.",
      confidence: "high",
      type: "wellness"
    });
  }

  if (daysUntilNextPeriod <= 3 && daysUntilNextPeriod >= 0) {
    insights.unshift({
      id: "prep-1",
      title: "Preparation Window",
      summary: `Your period is expected in about ${daysUntilNextPeriod} days. Now is a good time to stock up on supplies and prioritize self-care.`,
      confidence: "high",
      type: "prediction"
    });
  }

  return withMedicalGuardrails(insights);
}
