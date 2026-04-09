import { daysBetween } from "./date";
import { CycleEntry } from "../features/cycle/types";

export interface CycleSummary {
  startDate: string;
  endDate: string | null;
  length: number;
}

/**
 * Groups raw symptom entries into discrete cycles based on period start days.
 * A new cycle is considered to start when there is a period day after a non-period gap.
 */
export function getCycleHistory(entries: CycleEntry[]): CycleSummary[] {
  if (entries.length === 0) return [];

  // Sort entries by date ascending
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  const cycles: CycleSummary[] = [];
  let currentCycleStart: string | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    
    // Simple logic: if it's a period day and the previous day was NOT (or it's the first log), it's a start
    const isStart = entry.isPeriodDay && (i === 0 || !sorted[i-1].isPeriodDay || daysBetween(sorted[i-1].date, entry.date) > 7);

    if (isStart) {
      if (currentCycleStart) {
        // Close the previous cycle
        const prevCycle = cycles[cycles.length - 1];
        if (prevCycle) {
          prevCycle.endDate = entry.date;
          prevCycle.length = daysBetween(prevCycle.startDate, entry.date);
        }
      }
      currentCycleStart = entry.date;
      cycles.push({ startDate: entry.date, endDate: null, length: 0 });
    }
  }

  // Handle the last (ongoing) cycle
  if (cycles.length > 0) {
    const last = cycles[cycles.length - 1];
    const latestLog = sorted[sorted.length - 1].date;
    last.length = daysBetween(last.startDate, latestLog);
  }

  return cycles;
}

/**
 * Calculates correlations between symptoms and cycle phases.
 * (e.g. Average mood during Luteal vs Follicular)
 */
export function getSymptomCorrelations(entries: CycleEntry[]) {
  // Simple heuristic for now: Mood impact by phase
  // In a real app, this would use the prediction model to bin every entry into a phase
  return {
    hasData: entries.length > 5,
    totalLogs: entries.length
  };
}
