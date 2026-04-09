import { daysBetween, formatLongDate } from "../../lib/date";
import { CycleEntry, AIInsight, UserProfile } from "../cycle/types";
import { withMedicalGuardrails } from "./guardrails";
import { predictNextCycle, getPhaseForDate } from "./predictionModel";

export function buildInsights(profile: UserProfile, entries: CycleEntry[]): AIInsight[] {
  const prediction = predictNextCycle(profile, entries);
  const today = new Date().toISOString().slice(0, 10);
  const daysUntilNextPeriod = daysBetween(today, prediction.nextPeriodDate);

  const heavyFlowDays = entries.filter((entry) => entry.symptoms.flow === "heavy").length;

  const insights: AIInsight[] = [
    {
      id: "prediction-1",
      title: "Cycle Projection",
      summary: `Your next cycle is projected to start on ${formatLongDate(prediction.nextPeriodDate)}. This prediction is based on ${entries.length > 0 ? "your recent logs" : "your profile defaults"}.`,
      confidence: entries.length >= 3 ? "high" : "medium",
      type: "prediction"
    }
  ];

  // 1. Advanced Correlation: Energy per Phase
  const logsWithPhases = entries.map(e => ({
    ...e,
    phase: getPhaseForDate(e.date, prediction, entries)
  }));

  const ovulatoryLogs = logsWithPhases.filter(l => l.phase === 'ovulatory');
  const highEnergyInOvulation = ovulatoryLogs.filter(l => l.symptoms.energy === 'high').length;

  if (ovulatoryLogs.length >= 2 && highEnergyInOvulation > 0) {
    insights.push({
      id: "correlation-energy",
      title: "Energy Pattern Detected",
      summary: `We noticed you've logged high energy during ${Math.round((highEnergyInOvulation / ovulatoryLogs.length) * 100)}% of your Ovulatory phases. This is a great time for your most demanding workouts.`,
      confidence: "high",
      type: "pattern"
    });
  }

  // 2. Mood Rhythm
  const lutealLogs = logsWithPhases.filter(l => l.phase === 'luteal');
  const stableMoodInLuteal = lutealLogs.filter(l => l.symptoms.mood === 'stable').length;

  if (lutealLogs.length >= 2) {
    if (stableMoodInLuteal / lutealLogs.length < 0.5) {
       insights.push({
        id: "correlation-mood",
        title: "Luteal Sensitivity",
        summary: "Your logs show more mood variability during your Luteal phase. This often correlates with progesterone shifts. Prioritizing magnesium or gentle walks may help.",
        confidence: "medium",
        type: "wellness"
      });
    }
  }

  // 3. Fertility Window (Standard)
  insights.push({
    id: "ovulation-1",
    title: "Fertility Window",
    summary: `Your estimated fertile window is from ${formatLongDate(prediction.fertileWindowStart)} to ${formatLongDate(prediction.fertileWindowEnd)}, with ovulation predicted around ${formatLongDate(prediction.ovulationDate)}.`,
    confidence: "medium",
    type: "prediction"
  });

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
