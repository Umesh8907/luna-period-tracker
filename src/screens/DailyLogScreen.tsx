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
import { CycleEntry, SymptomLog } from "../features/cycle/types";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LogChip } from "../components/log/LogChip";
import { LogCategory } from "../components/log/LogCategory";

const MOODS = [
  { id: "happy", label: "Happy", icon: "happy-outline" },
  { id: "sensitive", label: "Sensitive", icon: "heart-outline" },
  { id: "sad", label: "Sad", icon: "sad-outline" },
  { id: "anxious", label: "Anxious", icon: "pulse-outline" },
  { id: "irritable", label: "Irritable", icon: "flash-outline" },
  { id: "stable", label: "Balanced", icon: "checkmark-circle-outline" },
];

const PHYSICAL = [
  { id: "cramps", label: "Cramps", icon: "flame-outline" },
  { id: "bloating", label: "Bloating", icon: "radio-button-on-outline" },
  { id: "acne", label: "Acne", icon: "sunny-outline" },
  { id: "headache", label: "Headache", icon: "bandage-outline" },
  { id: "backache", label: "Backache", icon: "accessibility-outline" },
  { id: "nausea", label: "Nausea", icon: "medical-outline" },
];

const DISCHARGE = [
  { id: "none", label: "None", icon: "close-outline" },
  { id: "sticky", label: "Sticky", icon: "water-outline" },
  { id: "creamy", label: "Creamy", icon: "color-filter-outline" },
  { id: "egg-white", label: "Egg White", icon: "egg-outline" },
  { id: "watery", label: "Watery", icon: "boat-outline" },
  { id: "spotting", label: "Spotting", icon: "help-buoy-outline" },
];

const LIFESTYLE = [
  { id: "exercise", label: "Exercise", icon: "barbell-outline" },
  { id: "alcohol", label: "Alcohol", icon: "wine-outline" },
  { id: "travel", label: "Travel", icon: "airplane-outline" },
  { id: "sex", label: "Sexual Activity", icon: "people-outline" },
];

export function DailyLogScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { entries, addEntry, updateEntry, loading, fetchData } = useCycleStore();
  
  const [selectedDate, setSelectedDate] = useState(route.params?.date || getTodayISO());
  
  const [isPeriod, setIsPeriod] = useState(false);
  const [flow, setFlow] = useState<any>("none");
  const [moods, setMoods] = useState<string[]>([]);
  const [physical, setPhysical] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [energy, setEnergy] = useState<any>("medium");
  const [stress, setStress] = useState<any>("low");
  const [libido, setLibido] = useState<any>("medium");
  const [discharge, setDischarge] = useState<any>("none");
  const [sleep, setSleep] = useState(7);

  const selectedEntry = useMemo(() => 
    entries.find(e => e.date === selectedDate), 
    [entries, selectedDate]
  );

  useEffect(() => {
    if (selectedEntry) {
      setIsPeriod(selectedEntry.isPeriodDay);
      setFlow(selectedEntry.symptoms.flow);
      setMoods(selectedEntry.symptoms.moods || []);
      setPhysical(selectedEntry.symptoms.physical || []);
      setLifestyle(selectedEntry.symptoms.lifestyle || []);
      setEnergy(selectedEntry.symptoms.energy);
      setStress(selectedEntry.symptoms.stress);
      setLibido(selectedEntry.symptoms.libido || "medium");
      setDischarge(selectedEntry.symptoms.discharge || "none");
      setSleep(selectedEntry.symptoms.sleepHours);
    } else {
      setIsPeriod(false);
      setFlow("none");
      setMoods([]);
      setPhysical([]);
      setLifestyle([]);
      setEnergy("medium");
      setStress("low");
      setLibido("medium");
      setDischarge("none");
      setSleep(7);
    }
  }, [selectedEntry, selectedDate]);

  const toggleMulti = (id: string, list: string[], setter: any) => {
    if (list.includes(id)) {
      setter(list.filter(i => i !== id));
    } else {
      setter([...list, id]);
    }
  };

  const handleSave = async () => {
    const updatedSymptomLog: SymptomLog = {
      flow,
      moods,
      physical,
      lifestyle,
      energy,
      stress,
      libido,
      discharge,
      sleepHours: sleep,
    };

    const updatedEntry: Partial<CycleEntry> = {
      date: selectedDate,
      isPeriodDay: isPeriod,
      symptoms: updatedSymptomLog
    };

    try {
      if (selectedEntry) {
        await updateEntry(selectedEntry.id, updatedEntry);
      } else {
        await addEntry(updatedEntry as Omit<CycleEntry, "id">);
      }
      Alert.alert("Success", "Daily log saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save log.");
    }
  };

  const changeDate = (days: number) => {
    const updated = addDays(selectedDate, days);
    setSelectedDate(updated);
  };

  const recentDates = useMemo(() => {
    const today = getTodayISO();
    const dates = [];
    for (let i = 0; i < 7; i++) {
        dates.push(addDays(today, -i));
    }
    return dates.reverse();
  }, []);

  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
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
            return (
              <TouchableOpacity 
                key={date} 
                onPress={() => setSelectedDate(date)} 
                style={[styles.dateChip, isSelected && styles.dateChipSelected]}
              >
                <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextSelected]}>
                  {dateObj.getDate()}
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Section */}
        <LogCategory title="Menstrual Flow" icon="water-outline">
            <View style={styles.row}>
                {["none", "light", "medium", "heavy"].map((f: any) => (
                    <LogChip 
                        key={f} 
                        id={f} 
                        label={f.charAt(0).toUpperCase() + f.slice(1)} 
                        icon="water" 
                        isSelected={flow === f} 
                        onPress={() => {
                            setFlow(f);
                            setIsPeriod(f !== "none");
                        }} 
                        color={colors.phaseMenstrual}
                    />
                ))}
            </View>
        </LogCategory>

        {/* Mood Section */}
        <LogCategory title="Moods" icon="happy-outline">
            {MOODS.map(m => (
                <LogChip 
                    key={m.id} 
                    {...m} 
                    isSelected={moods.includes(m.id)} 
                    onPress={() => toggleMulti(m.id, moods, setMoods)} 
                />
            ))}
        </LogCategory>

        {/* Physical Symptoms */}
        <LogCategory title="Physical" icon="body-outline">
            {PHYSICAL.map(p => (
                <LogChip 
                    key={p.id} 
                    {...p} 
                    isSelected={physical.includes(p.id)} 
                    onPress={() => toggleMulti(p.id, physical, setPhysical)} 
                    color={colors.accent}
                />
            ))}
        </LogCategory>

        {/* Discharge Section */}
        <LogCategory title="Fluid / Discharge" icon="color-filter-outline">
            {DISCHARGE.map(d => (
                <LogChip 
                    key={d.id} 
                    {...d} 
                    isSelected={discharge === d.id} 
                    onPress={() => setDischarge(d.id)} 
                    color={colors.phaseFollicular}
                />
            ))}
        </LogCategory>

        {/* Sleep Duration */}
        <LogCategory title="Sleep" icon="moon-outline">
            <View style={styles.counterRow}>
                <TouchableOpacity style={styles.countBtn} onPress={() => setSleep(Math.max(0, sleep - 0.5))}>
                    <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{sleep} <Text style={styles.counterUnit}>hrs</Text></Text>
                <TouchableOpacity style={styles.countBtn} onPress={() => setSleep(Math.min(24, sleep + 0.5))}>
                    <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </LogCategory>

        {/* Lifestyle */}
        <LogCategory title="Lifestyle" icon="fitness-outline">
            {LIFESTYLE.map(l => (
                <LogChip 
                    key={l.id} 
                    {...l} 
                    isSelected={lifestyle.includes(l.id)} 
                    onPress={() => toggleMulti(l.id, lifestyle, setLifestyle)} 
                    color={colors.success}
                />
            ))}
        </LogCategory>

        {/* Levels */}
        <LogCategory title="Levels" icon="stats-chart-outline">
            <View style={styles.levelGroup}>
                <Text style={styles.levelLabel}>Energy</Text>
                <View style={styles.row}>
                    {["low", "medium", "high"].map((e: any) => (
                        <LogChip 
                            key={e} 
                            id={e} 
                            label={e} 
                            icon="battery-charging" 
                            isSelected={energy === e} 
                            onPress={() => setEnergy(e)} 
                        />
                    ))}
                </View>
                <Text style={styles.levelLabel}>Stress</Text>
                <View style={styles.row}>
                    {["low", "medium", "high"].map((s: any) => (
                        <LogChip 
                            key={s} 
                            id={s} 
                            label={s} 
                            icon="flash" 
                            isSelected={stress === s} 
                            onPress={() => setStress(s)} 
                            color={colors.warning}
                        />
                    ))}
                </View>
            </View>
        </LogCategory>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{selectedEntry ? "Update Entry" : "Save Log"}</Text>}
        </TouchableOpacity>
        
        <View style={{ height: 120 }} />
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
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  countBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  counterUnit: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  levelGroup: {
    width: "100%",
    gap: spacing.sm,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
