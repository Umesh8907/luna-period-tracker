import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import { useCycleStore } from "../../store/useCycleStore";
import { colors, spacing, radius, typography } from "../../theme/tokens";

const GOALS = [
  { id: "predict", label: "Predict my next period", icon: "🗓️" },
  { id: "fertility", label: "Track for conception", icon: "✨" },
  { id: "syncing", label: "Cycle syncing for productivity", icon: "⚡" },
  { id: "symptoms", label: "Manage PMS and mood swings", icon: "🧘" },
  { id: "irregularity", label: "Understand cycle irregularity", icon: "📊" },
  { id: "hormonal", label: "Optimizing hormonal health", icon: "🩸" }
];

export function GoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const { completeOnboarding, profile } = useCycleStore();

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    try {
      await completeOnboarding({ 
        goals: selectedGoals,
        name: profile.name,
        age: profile.age,
        averageCycleLength: profile.averageCycleLength,
        averagePeriodLength: profile.averagePeriodLength,
        lastPeriodStart: profile.lastPeriodStart
      });
    } catch (error) {
      console.warn("[GoalsScreen] Onboarding completion failed, but continuing:", error);
      // We don't block anymore because the store handles local success
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>What's your goal?</Text>
      <Text style={styles.subtitle}>Tell us what you'd like to achieve with Luna. (Select all that apply)</Text>

      <View style={styles.goalsGrid}>
        {GOALS.map((goal) => (
          <TouchableOpacity 
            key={goal.id} 
            style={[
              styles.goalCard, 
              selectedGoals.includes(goal.id) && styles.goalCardActive
            ]} 
            onPress={() => toggleGoal(goal.id)}
          >
            <Text style={styles.goalIcon}>{goal.icon}</Text>
            <Text style={[
              styles.goalLabel,
              selectedGoals.includes(goal.id) && styles.goalLabelActive
            ]}>
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, selectedGoals.length === 0 && styles.buttonDisabled]} 
          onPress={handleFinish}
          disabled={selectedGoals.length === 0}
        >
          <Text style={styles.buttonText}>Finish Setup</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => completeOnboarding({})}
        >
          <Text style={styles.skipButtonText}>Skip for now (Dev Mode)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    flexGrow: 1,
    justifyContent: "center"
  },
  title: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.text
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 24
  },
  goalsGrid: {
    gap: spacing.md
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md
  },
  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  goalIcon: {
    fontSize: 24
  },
  goalLabel: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
    flex: 1
  },
  goalLabelActive: {
    color: colors.primary
  },
  footer: {
    marginTop: spacing.xl
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "#fff",
    fontSize: typography.body,
    fontWeight: "600"
  },
  skipButton: {
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm
  },
  skipButtonText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textDecorationLine: "underline"
  }
});
