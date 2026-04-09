export type SymptomSeverity = "none" | "mild" | "moderate" | "severe";

export type SymptomLog = {
  // Period & Fluid
  flow: "none" | "light" | "medium" | "heavy";
  discharge?: "none" | "sticky" | "creamy" | "egg-white" | "watery";
  
  // Categorized Symptoms (Multi-select)
  moods: string[]; // e.g., ['happy', 'anxious']
  physical: string[]; // e.g., ['bloating', 'acne', 'cramps']
  lifestyle: string[]; // e.g., ['exercise', 'alcohol']
  
  // Levels (Single-select)
  energy: "low" | "medium" | "high";
  stress: "low" | "medium" | "high";
  libido?: "low" | "medium" | "high";
  
  // Quantitative
  sleepHours: number;
  weight?: number;
  
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

