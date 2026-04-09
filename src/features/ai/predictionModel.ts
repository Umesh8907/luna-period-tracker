import { addDays, daysBetween, formatISO } from "../../lib/date";
import { CycleEntry, UserProfile } from "../cycle/types";

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';

export interface PhaseInfo {
  name: string;
  description: string;
  recommendation: string;
  icon: string;
}

export const PHASE_METADATA: Record<CyclePhase, PhaseInfo & { brief: string; focus: string; social: string }> = {
  menstrual: {
    name: "Menstrual Phase",
    description: "Your estrogen and progesterone levels are low. The uterine lining is shedding.",
    recommendation: "Focus on rest, hydration, and gentle movement like yoga.",
    icon: "water",
    brief: "Your body is working hard to reset. Prioritize comfort and listen to your energy cues.",
    focus: "Rest & Intuition",
    social: "Low - Choose cozy nights in"
  },
  follicular: {
    name: "Follicular Phase",
    description: "Estrogen levels start to rise, preparing an egg for release.",
    recommendation: "Energy is increasing. Great time for trying new things and creative projects.",
    icon: "leaf",
    brief: "New beginnings! Your brain is primed for brainstorming and starting new habits.",
    focus: "Planning & Growth",
    social: "Medium - Reconnect with friends"
  },
  ovulatory: {
    name: "Ovulatory Phase",
    description: "Luteinizing hormone peaks, triggering the release of an egg.",
    recommendation: "Peak fertility and high energy. Best time for high-intensity workouts and social events.",
    icon: "sunny",
    brief: "You are at your peak! Communication and confidence are naturally high today.",
    focus: "Execution & Power",
    social: "High - Perfect for networking"
  },
  luteal: {
    name: "Luteal Phase",
    description: "Progesterone peaks to pull the uterine lining together. PMS may occur.",
    recommendation: "Energy may dip. Focus on strength training and prioritize sleep.",
    icon: "moon",
    brief: "The nesting phase. Focus on crossing things off your list and preparing for rest.",
    focus: "Completion & Care",
    social: "Low/Med - Deep conversations only"
  },
  unknown: {
    name: "Transition",
    description: "Calculating your next phase based on your history.",
    recommendation: "Keep logging daily to improve prediction accuracy.",
    icon: "help-circle",
    brief: "We're matching your logs to your cycle patterns. Keep tracking!",
    focus: "Observation",
    social: "Balanced"
  }
};

export interface PredictionResult {
  nextPeriodDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  cycleLengthAverage: number;
  periodLengthAverage: number;
  isIrregular: boolean;
  phases: {
    date: string;
    phase: CyclePhase;
    isPredictedPeriod: boolean;
    isOvulationPeak: boolean;
  }[];
}

export function predictNextCycle(profile: UserProfile, entries: CycleEntry[]): PredictionResult {
  // 1. Identify starting dates of previous periods
  const periodStarts = entries
    .filter(e => e.isPeriodDay)
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce((acc: string[], curr) => {
      if (acc.length === 0) return [curr.date];
      const lastDate = acc[acc.length - 1];
      const diff = daysBetween(lastDate, curr.date);
      // If the gap is > 7 days, it's a new period start
      if (diff > 7) acc.push(curr.date);
      return acc;
    }, []);

  let avgCycle = profile.averageCycleLength || 28;
  let avgPeriod = profile.averagePeriodLength || 5;
  let isIrregular = false;

  // Calculate moving average if we have history
  if (periodStarts.length >= 2) {
    const cycleLengths: number[] = [];
    for (let i = 1; i < periodStarts.length; i++) {
      cycleLengths.push(daysBetween(periodStarts[i - 1], periodStarts[i]));
    }
    avgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
    const variance = cycleLengths.reduce((a, b) => a + Math.pow(b - avgCycle, 2), 0) / cycleLengths.length;
    isIrregular = Math.sqrt(variance) > 4;
  }

  // 2. Anchor the prediction on the LATEST log
  const today = formatISO(new Date());
  const lastStart = (periodStarts.length > 0 ? periodStarts[periodStarts.length - 1] : profile.lastPeriodStart) || today;
  
  // Calculate next period DATE based on anchor
  const nextPeriodDate = addDays(lastStart, avgCycle);
  const ovulationDate = addDays(nextPeriodDate, -14); 

  const phases: { date: string; phase: CyclePhase; isPredictedPeriod: boolean; isOvulationPeak: boolean }[] = [];
  const startOffset = -180; // 6 months back
  const totalSlots = 240;   // 8 months total

  for (let i = startOffset; i < totalSlots + startOffset; i++) {
    const currentDate = addDays(nextPeriodDate, i);
    
    // Calculate position in cycle relative to the anchor (lastStart)
    const daysSinceLastStart = daysBetween(lastStart, currentDate);
    let cycleDay = daysSinceLastStart % avgCycle;
    if (cycleDay < 0) cycleDay += avgCycle;

    let phase: CyclePhase = 'follicular';
    let isPredictedPeriod = false;
    let isOvulationPeak = currentDate === ovulationDate;
    
    if (cycleDay < avgPeriod) {
      phase = 'menstrual';
      // Only show prediction if it's in the future AND we haven't reached it relative to today
      // This prevents "Dotted" borders appearing over current "Solid" logs
      if (currentDate >= today) {
        // If today is within a period, don't predict a "new" one for those same days
        if (daysBetween(lastStart, today) >= avgPeriod || currentDate > addDays(lastStart, avgPeriod)) {
           isPredictedPeriod = true;
        }
      }
    } else if (cycleDay >= avgCycle - 16 && cycleDay <= avgCycle - 11) {
      phase = 'ovulatory';
    } else if (cycleDay >= avgCycle - 11) {
      phase = 'luteal';
    }
    
    phases.push({ date: currentDate, phase, isPredictedPeriod, isOvulationPeak });
  }

  return {
    nextPeriodDate,
    ovulationDate,
    fertileWindowStart: addDays(ovulationDate, -4),
    fertileWindowEnd: addDays(ovulationDate, 1),
    cycleLengthAverage: avgCycle,
    periodLengthAverage: avgPeriod,
    isIrregular,
    phases
  };
}

export function getPhaseForDate(date: string, prediction: PredictionResult, entries: CycleEntry[]): CyclePhase {
  const entry = entries.find(e => e.date === date);
  if (entry?.isPeriodDay) return 'menstrual';

  const predictedPhase = prediction.phases.find(p => p.date === date);
  if (predictedPhase) return predictedPhase.phase;

  return 'unknown';
}
