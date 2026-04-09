import React, { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../components/Card";
import { CycleCalendar } from "../components/CycleCalendar";
import { useCycleStore } from "../store/useCycleStore";
import { colors, spacing, typography, radius } from "../theme/tokens";
import { formatLongDate, addDays, getTodayISO } from "../lib/date";
import { predictNextCycle, getPhaseForDate, PHASE_METADATA } from "../features/ai/predictionModel";

import { useNavigation } from "@react-navigation/native";

export function CycleLogScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile, entries, addEntry, updateEntry, deleteEntry } = useCycleStore();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());

  const prediction = useMemo(() => predictNextCycle(profile, entries), [profile, entries]);
  const currentPhase = getPhaseForDate(selectedDate, prediction, entries);
  const phaseInfo = PHASE_METADATA[currentPhase];
  const selectedEntry = entries.find(e => e.date === selectedDate);

  const togglePeriod = async () => {
    if (selectedEntry) {
      await updateEntry(selectedEntry.id, { isPeriodDay: !selectedEntry.isPeriodDay });
    } else {
      await addEntry({
        date: selectedDate,
        isPeriodDay: true,
        symptoms: {
          mood: "stable",
          energy: "medium",
          flow: "medium",
          sleepHours: 8,
          stressLevel: "low",
          cramps: "none"
        }
      });
    }
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert("Delete Log", "Are you sure you want to delete this log?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteEntry(id) }
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.stickyHeader, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Menstrual Calendar</Text>
        <Text style={styles.subtitle}>Track your cycle and predict your next period.</Text>
      </View>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

        <CycleCalendar 
          profile={profile} 
          entries={entries} 
          onSelectDate={setSelectedDate} 
          selectedDate={selectedDate}
        />

        {/* Phase Insight Card */}
        <View style={[styles.insightCard, { borderColor: getPhaseColor(currentPhase) }]}>
          <View style={styles.insightHeader}>
            <View style={[styles.iconContainer, { backgroundColor: getPhaseColor(currentPhase) + "22" }]}>
              <Ionicons name={phaseInfo.icon as any} size={24} color={getPhaseColor(currentPhase)} />
            </View>
            <View>
              <Text style={styles.insightEyebrow}>{formatLongDate(selectedDate)}</Text>
              <Text style={[styles.insightTitle, { color: getPhaseColor(currentPhase) }]}>{phaseInfo.name}</Text>
            </View>
          </View>
          
          <Text style={styles.insightDesc}>{phaseInfo.description}</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.periodToggle, selectedEntry?.isPeriodDay && styles.periodToggleActive]} 
              onPress={togglePeriod}
            >
              <Ionicons name="water" size={18} color={selectedEntry?.isPeriodDay ? "#fff" : colors.primary} />
              <Text style={[styles.periodToggleText, selectedEntry?.isPeriodDay && styles.periodToggleTextActive]}>
                {selectedEntry?.isPeriodDay ? "Period Logged" : "Log Period"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dailyLogButton} 
              onPress={() => navigation.navigate("DailyLog", { date: selectedDate })}
            >
              <Ionicons name="journal-outline" size={18} color={colors.text} />
              <Text style={styles.dailyLogButtonText}>Daily Log</Text>
            </TouchableOpacity>
          </View>

          {selectedEntry && (
            <View style={styles.loggedInfo}>
               <View style={styles.separator} />
               <View style={styles.row}>
                 <Text style={styles.label}>Log Summary</Text>
                 <Text style={styles.value}>{selectedEntry.symptoms.mood} mood • {selectedEntry.symptoms.flow} flow</Text>
               </View>
               <TouchableOpacity 
                  style={styles.deleteLink} 
                  onPress={() => handleDeleteEntry(selectedEntry.id)}
               >
                 <Ionicons name="trash-outline" size={14} color={colors.danger} />
                 <Text style={styles.deleteLinkText}>Delete log</Text>
               </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.historyTitle}>Recent Logs</Text>
        {entries.slice(0, 3).map((entry) => (
          <Card key={entry.id} eyebrow={entry.isPeriodDay ? "Period day" : "Daily check-in"} title={formatLongDate(entry.date)}>
             <TouchableOpacity onPress={() => setSelectedDate(entry.date)}>
                <Text style={styles.caption}>{entry.symptoms.flow} flow • {entry.symptoms.mood} mood</Text>
             </TouchableOpacity>
          </Card>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function getPhaseColor(phase: string) {
  switch(phase) {
    case 'menstrual': return colors.phaseMenstrual;
    case 'follicular': return colors.phaseFollicular;
    case 'ovulatory': return colors.phaseOvulatory;
    case 'luteal': return colors.phaseLuteal;
    default: return colors.textMuted;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  stickyHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "11", // Subtle separator
  },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "800" },
  subtitle: { color: colors.textMuted, fontSize: typography.body },
  
  insightCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  insightHeader: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  iconContainer: { width: 48, height: 48, borderRadius: radius.md, justifyContent: "center", alignItems: "center" },
  insightEyebrow: { fontSize: typography.caption, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1 },
  insightTitle: { fontSize: typography.heading, fontWeight: "800" },
  insightDesc: { fontSize: typography.body, color: colors.text, lineHeight: 22 },
  
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  periodToggle: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  periodToggleActive: {
    backgroundColor: colors.primary,
  },
  periodToggleText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  periodToggleTextActive: {
    color: "#fff",
  },
  dailyLogButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  dailyLogButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  
  loggedInfo: { gap: spacing.sm },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: colors.textMuted, fontSize: typography.caption },
  value: { color: colors.text, fontSize: typography.body, fontWeight: "600", textTransform: "capitalize" },
  
  deleteLink: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.md, alignSelf: "center" },
  deleteLinkText: { color: colors.danger, fontSize: typography.caption, fontWeight: "600" },

  historyTitle: { fontSize: typography.heading, fontWeight: "700", color: colors.text, marginTop: spacing.md },
  caption: { color: colors.textMuted, fontSize: typography.caption, textTransform: "capitalize" }
});
