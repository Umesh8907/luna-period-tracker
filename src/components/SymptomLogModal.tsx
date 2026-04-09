import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../theme/tokens";
import { CycleEntry, SymptomSeverity } from "../features/cycle/types";
import { formatLongDate } from "../lib/date";

interface Props {
  isVisible: boolean;
  date: string;
  initialEntry?: CycleEntry;
  onClose: () => void;
  onSave: (entry: Partial<CycleEntry>) => void;
}

export function SymptomLogModal({ isVisible, date, initialEntry, onClose, onSave }: Props) {
  const [isPeriod, setIsPeriod] = useState(initialEntry?.isPeriodDay ?? false);
  const [mood, setMood] = useState(initialEntry?.symptoms?.mood ?? "stable");
  const [energy, setEnergy] = useState(initialEntry?.symptoms?.energy ?? "medium");
  const [sleep, setSleep] = useState(initialEntry?.symptoms?.sleepHours ?? 7);
  const [stress, setStress] = useState(initialEntry?.symptoms?.stressLevel ?? "low");
  const [flow, setFlow] = useState(initialEntry?.symptoms?.flow ?? "none");

  const handleSave = () => {
    onSave({
      date,
      isPeriodDay: isPeriod,
      symptoms: {
        mood,
        energy,
        flow,
        sleepHours: sleep,
        stressLevel: stress,
        cramps: isPeriod ? "mild" : "none", // simplified for the modal
      }
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{formatLongDate(date)}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Period Tracker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Are you on your period?</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, isPeriod && styles.toggleBtnActive]}
                  onPress={() => setIsPeriod(true)}
                >
                  <Text style={[styles.toggleText, isPeriod && styles.toggleTextActive]}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleBtn, !isPeriod && styles.toggleBtnActiveInactive]}
                  onPress={() => setIsPeriod(false)}
                >
                  <Text style={[styles.toggleText, !isPeriod && styles.toggleTextActive]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sleep Counter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sleep Duration</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity style={styles.countBtn} onPress={() => setSleep(Math.max(0, sleep - 0.5))}>
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{sleep} hours</Text>
                <TouchableOpacity style={styles.countBtn} onPress={() => setSleep(Math.min(24, sleep + 0.5))}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stress Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stress Level</Text>
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

            {/* Mood Segment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood</Text>
              <View style={styles.segments}>
                {["low", "stable", "high"].map((m: any) => (
                  <TouchableOpacity 
                    key={m}
                    style={[styles.segment, mood === m && styles.segmentActive]}
                    onPress={() => setMood(m)}
                  >
                    <Text style={[styles.segmentText, mood === m && styles.segmentTextActive]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Daily Log</Text>
            </TouchableOpacity>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleBtnActiveInactive: {
    backgroundColor: colors.textMuted,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  toggleTextActive: {
    color: "#fff",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    minWidth: 100,
    textAlign: "center",
  },
  segments: {
    flexDirection: "row",
    gap: spacing.sm,
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
