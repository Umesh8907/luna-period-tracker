export type SymptomSeverity = "none" | "mild" | "moderate" | "severe";

export type SymptomLog = {
  cramps: SymptomSeverity;
  mood: "low" | "stable" | "high";
  energy: "low" | "medium" | "high";
  flow: "none" | "light" | "medium" | "heavy";
  sleepHours: number;
  stressLevel: "low" | "medium" | "high";
  notes?: string;
};

export type CycleEntry = {
  id: string;
  date: string;
  isPeriodDay: boolean;
  symptoms: SymptomLog;
};

export type UserProfile = {
  name: string;
  age?: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStart: string;
  goals: string[];
  hasCompletedOnboarding: boolean;
};

export type AIInsight = {
  id: string;
  title: string;
  summary: string;
  confidence: "low" | "medium" | "high";
  type: "prediction" | "pattern" | "wellness" | "guardrail";
};

