import React, { useState, useEffect, useMemo } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCycleStore } from "../store/useCycleStore";
import { colors, spacing, radius, typography } from "../theme/tokens";
import { formatLongDate, addDays, getTodayISO } from "../lib/date";
import { CycleEntry } from "../features/cycle/types";

import { useRoute } from "@react-navigation/native";

export function DailyLogScreen() {
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { entries, addEntry, updateEntry, loading, fetchData } = useCycleStore();
  
  // Initialize with param date if available, otherwise today
  const [selectedDate, setSelectedDate] = useState(route.params?.date || getTodayISO());
  
  // Sync selectedDate if route params change
  useEffect(() => {
    if (route.params?.date) {
      setSelectedDate(route.params.date);
    }
  }, [route.params?.date]);
  
  // Local state for logging
  const [isPeriod, setIsPeriod] = useState(false);
  const [mood, setMood] = useState<"low" | "stable" | "high">("stable");
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState<"low" | "medium" | "high">("low");
  const [flow, setFlow] = useState<"none" | "light" | "medium" | "heavy">("none");

  const selectedEntry = useMemo(() => 
    entries.find(e => e.date === selectedDate), 
    [entries, selectedDate]
  );

  // Sync state when selectedEntry or selectedDate changes
  useEffect(() => {
    if (selectedEntry) {
      setIsPeriod(selectedEntry.isPeriodDay);
      setMood(selectedEntry.symptoms.mood);
      setEnergy(selectedEntry.symptoms.energy);
      setSleep(selectedEntry.symptoms.sleepHours);
      setStress(selectedEntry.symptoms.stressLevel);
      setFlow(selectedEntry.symptoms.flow);
    } else {
      // Default values for new entry
      setIsPeriod(false);
      setMood("stable");
      setEnergy("medium");
      setSleep(7);
      setStress("low");
      setFlow("none");
    }
  }, [selectedEntry, selectedDate]);

  const handleSave = async () => {
    const updatedEntry: Partial<CycleEntry> = {
      date: selectedDate,
      isPeriodDay: isPeriod,
      symptoms: {
        mood,
        energy,
        flow,
        sleepHours: sleep,
        stressLevel: stress,
        cramps: isPeriod ? "mild" : "none", // simplified
      }
    };

    try {
      if (selectedEntry) {
        await updateEntry(selectedEntry.id, updatedEntry);
      } else {
        await addEntry(updatedEntry as Omit<CycleEntry, "id">);
      }
      Alert.alert("Success", "Daily log saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save log. Please try again.");
    }
  };

  const changeDate = (days: number) => {
    const updated = addDays(selectedDate, days);
    setSelectedDate(updated);
  };

  const recentDates = useMemo(() => {
    const today = getTodayISO();
    const dates = [];
    for (let i = 0; i < 6; i++) {
      dates.push(addDays(today, -i));
    }
    return dates.reverse(); // Previous dates to the left, today on the right
  }, []);

  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Date Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => changeDate(-1)} 
          style={[styles.dateNav, selectedDate <= recentDates[0] && styles.dateNavDisabled]}
          disabled={selectedDate <= recentDates[0]}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={selectedDate <= recentDates[0] ? colors.textMuted : colors.primary} 
          />
        </TouchableOpacity>
        
        <View style={styles.dateDisplay}>
          <Text style={styles.dateLabel}>{formatLongDate(selectedDate)}</Text>
          <Text style={styles.dateTitle}>Daily Check-in</Text>
        </View>

        <TouchableOpacity 
          onPress={() => changeDate(1)} 
          style={[styles.dateNav, selectedDate === getTodayISO() && styles.dateNavDisabled]}
          disabled={selectedDate === getTodayISO()}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={selectedDate === getTodayISO() ? colors.textMuted : colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Quick Date Selector */}
      <View style={styles.quickDateContainer}>
        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickDateContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {recentDates.map((date) => {
            const isSelected = date === selectedDate;
            const dateObj = new Date(`${date}T00:00:00`);
            const dayNum = dateObj.getDate();
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <TouchableOpacity 
                key={date} 
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dateChip, 
                  isSelected && styles.dateChipSelected
                ]}
              >
                <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>
                  {dayName}
                </Text>
                <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextSelected]}>
                  {dayNum}
                </Text>
                <View style={styles.dotContainer}>
                  {entries.find(e => e.date === date)?.isPeriodDay && (
                    <View style={[styles.periodDot, isSelected && styles.dotSelected]} />
                  )}
                  {entries.some(e => e.date === date && !e.isPeriodDay) && (
                    <View style={[styles.logDot, isSelected && styles.dotSelected]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.primary} />
        }
      >
        {/* Period Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Period Log</Text>
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.toggleBtn, isPeriod && styles.toggleBtnActive]}
              onPress={() => setIsPeriod(true)}
            >
              <Text style={[styles.toggleText, isPeriod && styles.toggleTextActive]}>Yes, I'm on it</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, !isPeriod && styles.toggleBtnActive]}
              onPress={() => setIsPeriod(false)}
            >
              <Text style={[styles.toggleText, !isPeriod && styles.toggleTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
          
          {isPeriod && (
            <View style={styles.subSection}>
              <Text style={styles.subTitle}>Flow Intensity</Text>
              <View style={styles.segments}>
                {["light", "medium", "heavy"].map((f: any) => (
                  <TouchableOpacity 
                    key={f}
                    style={[styles.segment, flow === f && styles.segmentActive]}
                    onPress={() => setFlow(f)}
                  >
                    <Text style={[styles.segmentText, flow === f && styles.segmentTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Mood Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="happy-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Mood</Text>
          </View>
          <View style={styles.segments}>
            {[
              { id: "low", icon: "sad-outline", label: "Low" },
              { id: "stable", icon: "stop-outline", label: "Stable" },
              { id: "high", icon: "happy-outline", label: "Great" }
            ].map((m: any) => (
              <TouchableOpacity 
                key={m.id}
                style={[styles.moodCard, mood === m.id && styles.moodCardActive]}
                onPress={() => setMood(m.id)}
              >
                <Ionicons name={m.icon} size={28} color={mood === m.id ? colors.primary : colors.textMuted} />
                <Text style={[styles.moodLabel, mood === m.id && styles.moodLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sleep Duration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="moon-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Sleep Duration</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.countBtn} onPress={() => setSleep(Math.max(0, sleep - 0.5))}>
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.counterTextContainer}>
              <Text style={styles.counterValue}>{sleep}</Text>
              <Text style={styles.counterUnit}>hours</Text>
            </View>
            <TouchableOpacity style={styles.countBtn} onPress={() => setSleep(Math.min(24, sleep + 0.5))}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stress Level */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Stress Level</Text>
          </View>
          <View style={styles.segments}>
            {["low", "medium", "high"].map((s: any) => (
              <TouchableOpacity 
                key={s}
                style={[styles.segment, stress === s && styles.segmentActive]}
                onPress={() => setStress(s)}
              >
                <Text style={[styles.segmentText, stress === s && styles.segmentTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>{selectedEntry ? "Update Log" : "Save Daily Log"}</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  dateNav: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  dateNavDisabled: {
    opacity: 0.3,
  },
  dateDisplay: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  quickDateContainer: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  quickDateContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  dateChip: {
    width: 50,
    height: 70,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 2,
  },
  dateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dateChipDay: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  dateChipNum: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  dateChipTextSelected: {
    color: "#fff",
  },
  dotContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
    height: 6,
    alignItems: "center",
  },
  periodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.phaseMenstrual,
  },
  logDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  dotSelected: {
    backgroundColor: "#fff",
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  subSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: 6,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: radius.md,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleBtnInactive: {
    backgroundColor: colors.surface,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: "#fff",
  },
  segments: {
    flexDirection: "row",
    gap: spacing.md,
  },
  segment: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  segmentTextActive: {
    color: colors.primary,
  },
  moodCard: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  moodCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  moodLabelActive: {
    color: colors.primary,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  counterTextContainer: {
    alignItems: "center",
  },
  counterValue: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
  },
  counterUnit: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});
