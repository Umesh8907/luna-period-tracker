import { create } from "zustand";
import { CycleEntry, UserProfile } from "../features/cycle/types";
import { supabase } from "../lib/supabase";
import { userProfile as defaultProfile } from "../features/cycle/mockData";

type CycleState = {
  profile: UserProfile;
  entries: CycleEntry[];
  loading: boolean;
  isInitialized: boolean;
  fetchData: () => Promise<void>;
  addEntry: (entry: Omit<CycleEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<CycleEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  seedDummyData: () => Promise<void>;
};

export const useCycleStore = create<CycleState>((set, get) => ({
  profile: defaultProfile,
  entries: [],
  loading: false,
  isInitialized: false,

  fetchData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ loading: true });
    
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileError && profileData) {
      const newProfile = {
        name: profileData.name,
        age: profileData.age,
        averageCycleLength: profileData.average_cycle_length,
        averagePeriodLength: profileData.average_period_length,
        lastPeriodStart: profileData.last_period_start,
        goals: profileData.goals,
        hasCompletedOnboarding: profileData.has_completed_onboarding
      };

      // Only update if something actually changed to prevent infinite loops
      const currentProfile = get().profile;
      if (JSON.stringify(newProfile) !== JSON.stringify(currentProfile)) {
        set({ profile: newProfile });
      }
    } else if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it with defaults (snake_case for DB)
      const dbDefaults = {
        name: defaultProfile.name,
        age: defaultProfile.age,
        average_cycle_length: defaultProfile.averageCycleLength,
        average_period_length: defaultProfile.averagePeriodLength,
        last_period_start: defaultProfile.lastPeriodStart,
        goals: defaultProfile.goals,
        has_completed_onboarding: defaultProfile.hasCompletedOnboarding
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id, ...dbDefaults });
      
      if (!insertError) set({ profile: defaultProfile });
    }

    // Fetch entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('cycle_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!entriesError && entriesData) {
      // Map DB snake_case back to app camelCase
      const mappedEntries = entriesData.map(e => ({
        id: e.id,
        date: e.date,
        isPeriodDay: e.is_period_day,
        symptoms: e.symptoms
      }));
      set({ entries: mappedEntries });
    }

    set({ loading: false, isInitialized: true });
  },

  addEntry: async (entry) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('cycle_entries')
      .insert({ 
        user_id: user.id,
        date: entry.date,
        is_period_day: entry.isPeriodDay,
        symptoms: entry.symptoms
      })
      .select()
      .single();

    if (!error && data) {
      const mapped = {
        id: data.id,
        date: data.date,
        isPeriodDay: data.is_period_day,
        symptoms: data.symptoms
      };
      set((state) => ({
        entries: [mapped, ...state.entries]
      }));
    }
  },
  updateEntry: async (id, updates) => {
    const { error } = await supabase
      .from('cycle_entries')
      .update({
        is_period_day: updates.isPeriodDay,
        symptoms: updates.symptoms,
        date: updates.date
      })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        entries: state.entries.map(e => e.id === id ? { ...e, ...updates } : e)
      }));
    }
  },

  deleteEntry: async (id) => {
    const { error } = await supabase
      .from('cycle_entries')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        entries: state.entries.filter(e => e.id !== id)
      }));
    }
  },

  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      set((state) => ({
        profile: { ...state.profile, ...updates }
      }));
    }
  },

  completeOnboarding: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { profile } = get();

    const updates = { 
      name: data.name ?? profile.name,
      age: data.age ?? profile.age,
      average_cycle_length: data.averageCycleLength ?? profile.averageCycleLength,
      average_period_length: data.averagePeriodLength ?? profile.averagePeriodLength,
      last_period_start: data.lastPeriodStart ?? profile.lastPeriodStart,
      goals: data.goals ?? profile.goals,
      has_completed_onboarding: true 
    };

    console.log("[useCycleStore] Attempting to complete onboarding with updates:", updates);

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.warn("[useCycleStore] Remote profile update failed, but proceeding locally:", error);
      // We still proceed locally so the user isn't stuck behind a network error
    }

    set((state) => ({
      profile: { ...state.profile, ...data, hasCompletedOnboarding: true }
    }));
  },
  
  seedDummyData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    set({ loading: true });

    try {
      // 1. Clear ALL existing entries
      const { error: deleteError } = await supabase.from('cycle_entries').delete().eq('user_id', user.id);
      if (deleteError) throw deleteError;

      // 2. Prepare 3 months of data (Feb, Mar, Apr)
      // Use UTC dates to avoid local timezone shifts
      const rawCycles = [
        { year: 2026, month: 1, day: 10, days: 5 }, // Feb (Month is 0-indexed)
        { year: 2026, month: 2, day: 11, days: 5 }, // Mar
        { year: 2026, month: 3, day: 7, days: 5 },  // Apr
      ];

      const newEntries = [];
      for (const cycle of rawCycles) {
        for (let i = 0; i < cycle.days; i++) {
          const date = new Date(Date.UTC(cycle.year, cycle.month, cycle.day + i));
          newEntries.push({
            user_id: user.id,
            date: date.toISOString().slice(0, 10),
            is_period_day: true,
            symptoms: { flow: 'medium', mood: 'stable', energy: 'medium', cramps: 'none' }
          });
        }
      }

      // 3. Bulk Insert
      const { error: insertError } = await supabase.from('cycle_entries').insert(newEntries);
      if (insertError) throw insertError;

      // 4. Update Profile Settings
      const profileUpdates = {
        average_cycle_length: 28,
        average_period_length: 5,
        last_period_start: '2026-04-07',
        has_completed_onboarding: true
      };

      const { error: profileError } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
      if (profileError) throw profileError;

      // 5. Final Step: Reload everything
      const { fetchData } = get();
      await fetchData();
      console.log("[useCycleStore] Seed successful");
    } catch (err) {
      console.error("[useCycleStore] Seed failed:", err);
    } finally {
      set({ loading: false });
    }
  }
}));
