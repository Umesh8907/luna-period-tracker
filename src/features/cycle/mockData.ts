import { CycleEntry, UserProfile } from "./types";

export const userProfile: UserProfile = {
  name: "",
  age: undefined,
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: new Date().toISOString().slice(0, 10),
  goals: [],
  hasCompletedOnboarding: false
};

export const cycleEntries: CycleEntry[] = [];
