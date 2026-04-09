import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";
import { useCycleStore } from "../../store/useCycleStore";
import { colors, spacing, radius, typography } from "../../theme/tokens";
import { useNavigation } from "@react-navigation/native";

export function CycleStatsScreen() {
  const [cycle, setCycle] = useState(28);
  const [period, setPeriod] = useState(5);
  const updateProfile = useCycleStore((state) => state.updateProfile);
  const navigation = useNavigation<any>();

  const handleNext = () => {
    updateProfile({ 
      averageCycleLength: cycle,
      averagePeriodLength: period
    });
    navigation.navigate("LastPeriod");
  };

  const handleSkip = () => {
    // Defaults are already in the store and database, but we'll re-apply them for safety
    updateProfile({ 
      averageCycleLength: 28,
      averagePeriodLength: 5
    });
    navigation.navigate("LastPeriod");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cycle Stats</Text>
      <Text style={styles.subtitle}>Help us establish a baseline for your predictions.</Text>

      <View style={styles.section}>
        <Text style={styles.label}>How many days is your average cycle?</Text>
        <View style={styles.picker}>
          {[21, 28, 30, 35].map((val) => (
            <TouchableOpacity 
              key={val} 
              style={[styles.chip, cycle === val && styles.chipActive]} 
              onPress={() => setCycle(val)}
            >
              <Text style={[styles.chipText, cycle === val && styles.chipTextActive]}>{val} days</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>How many days does your period last?</Text>
        <View style={styles.picker}>
          {[3, 5, 7, 10].map((val) => (
            <TouchableOpacity 
              key={val} 
              style={[styles.chip, period === val && styles.chipActive]} 
              onPress={() => setPeriod(val)}
            >
              <Text style={[styles.chipText, period === val && styles.chipTextActive]}>{val} days</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>I'm not sure, use defaults</Text>
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
  section: {
    gap: spacing.md
  },
  label: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text
  },
  picker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    color: colors.text
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600"
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.md
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: typography.body,
    fontWeight: "600"
  },
  skipButton: {
    alignItems: "center"
  },
  skipText: {
    color: colors.textMuted,
    fontSize: typography.body,
    textDecorationLine: "underline"
  }
});
