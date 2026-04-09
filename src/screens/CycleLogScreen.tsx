import React, { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../components/Card";
import { CycleCalendar } from "../components/CycleCalendar";
import { useCycleStore } from "../store/useCycleStore";
import { colors, spacing, typography, radius } from "../theme/tokens";
import { formatLongDate, addDays } from "../lib/date";
import { predictNextCycle, getPhaseForDate, PHASE_METADATA } from "../features/ai/predictionModel";

export function CycleLogScreen() {
  const insets = useSafeAreaInsets();
  const { profile, entries, addEntry, deleteEntry } = useCycleStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const prediction = useMemo(() => predictNextCycle(profile, entries), [profile, entries]);
  const currentPhase = getPhaseForDate(selectedDate, prediction, entries);
  const phaseInfo = PHASE_METADATA[currentPhase];
  const selectedEntry = entries.find(e => e.date === selectedDate);

  const handleLogPeriodRange = async () => {
    try {
      const avgLen = profile.averagePeriodLength || 5;
      const promises = [];
      for (let i = 0; i < avgLen; i++) {
        const date = addDays(selectedDate, i);
        if (!entries.find(e => e.date === date)) {
          promises.push(addEntry({
            date,
            isPeriodDay: true,
            symptoms: { cramps: "mild", mood: "stable", energy: "medium", flow: "medium" }
          }));
        }
      }
      await Promise.all(promises);
      Alert.alert("Success", `Logged ${avgLen} days of period starting ${formatLongDate(selectedDate)}`);
    } catch (error) {
      Alert.alert("Error logging period range");
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
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Cycle Calendar</Text>
          <Text style={styles.subtitle}>Track your symptoms and log periods.</Text>
        </View>

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
          
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={16} color={colors.warning} />
            <Text style={styles.tipText}>{phaseInfo.recommendation}</Text>
          </View>

          {selectedEntry ? (
            <View style={styles.loggedInfo}>
               <View style={styles.separator} />
               <View style={styles.row}>
                 <Text style={styles.label}>Logged Symptoms</Text>
                 <Text style={styles.value}>{selectedEntry.symptoms.flow} flow • {selectedEntry.isPeriodDay ? "Period" : "Safe"}</Text>
               </View>
               <TouchableOpacity 
                  style={styles.deleteLink} 
                  onPress={() => handleDeleteEntry(selectedEntry.id)}
               >
                 <Ionicons name="trash-outline" size={14} color={colors.danger} />
                 <Text style={styles.deleteLinkText}>Delete this log</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.logButton, { backgroundColor: getPhaseColor(currentPhase) }]} onPress={handleLogPeriodRange}>
              <Text style={styles.logButtonText}>Log Period from this day</Text>
            </TouchableOpacity>
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
  header: { gap: spacing.xs },
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
  
  tipBox: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center"
  },
  tipText: { flex: 1, fontSize: typography.caption, color: colors.text, fontStyle: "italic" },
  
  logButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.sm
  },
  logButtonText: { color: "#fff", fontWeight: "700", fontSize: typography.body },
  
  loggedInfo: { gap: spacing.sm },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: colors.textMuted, fontSize: typography.caption },
  value: { color: colors.text, fontSize: typography.body, fontWeight: "600", textTransform: "capitalize" },
  
  deleteLink: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.xs },
  deleteLinkText: { color: colors.danger, fontSize: typography.caption, fontWeight: "600" },

  historyTitle: { fontSize: typography.heading, fontWeight: "700", color: colors.text, marginTop: spacing.md },
  caption: { color: colors.textMuted, fontSize: typography.caption, textTransform: "capitalize" }
});
