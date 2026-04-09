import React from "react";
import { ScrollView, StyleSheet, Text, View, RefreshControl, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../components/Card";
import { CycleCircle } from "../components/CycleCircle";
import { useCycleStore } from "../store/useCycleStore";
import { predictNextCycle } from "../features/ai/predictionModel";
import { daysBetween, formatLongDate } from "../lib/date";
import { colors, radius, spacing, typography } from "../theme/tokens";

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile, entries, loading, fetchData } = useCycleStore();
  const prediction = predictNextCycle(profile, entries);
  
  const today = new Date().toISOString().slice(0, 10);
  const daysSinceStart = daysBetween(profile.lastPeriodStart, today);
  const currentDay = Math.max(1, (daysSinceStart % profile.averageCycleLength) + 1);
  const daysLeft = daysBetween(today, prediction.nextPeriodDate);

  // Simple phase calculation for UI display
  let phase = "Follicular Phase";
  if (currentDay <= profile.averagePeriodLength) phase = "Menstrual Phase";
  else if (currentDay >= 13 && currentDay <= 15) phase = "Ovulatory Phase";
  else if (currentDay > 15) phase = "Luteal Phase";

  return (
    <View style={styles.screen}>
      <ScrollView 
        style={styles.screen} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.primary} />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>Good Morning, {profile.name}</Text>
          <CycleCircle 
            currentDay={currentDay} 
            totalDays={profile.averageCycleLength} 
            phase={phase}
          />
        </View>

        <Card 
          eyebrow="Next cycle" 
          title={`${daysLeft} day${daysLeft === 1 ? "" : "s"} until expected start`} 
          tone="accent"
        >
          <Text style={styles.onAccentText}>
            Projected around {formatLongDate(prediction.nextPeriodDate)}
          </Text>
        </Card>

        <View style={styles.grid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Avg. cycle</Text>
            <Text style={styles.metricValue}>{prediction.cycleLengthAverage} days</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Avg. period</Text>
            <Text style={styles.metricValue}>{profile.averagePeriodLength} days</Text>
          </View>
        </View>

        <Card eyebrow="Recent activity" title="Latest Logs">
          {entries.length > 0 ? (
            entries.slice(0, 3).map((entry) => (
              <View key={entry.id} style={styles.row}>
                <View>
                  <Text style={styles.body}>{formatLongDate(entry.date)}</Text>
                  <Text style={styles.caption}>{entry.isPeriodDay ? "Period Day" : "Log"}</Text>
                </View>
                <Text style={styles.badge}>{entry.symptoms.flow}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.body}>No logs found. Start tracking in the Log tab.</Text>
          )}
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.md,
    gap: spacing.sm
  },
  kicker: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "700",
    textAlign: "center"
  },
  onAccentText: {
    color: "#FFF",
    fontSize: typography.body,
    lineHeight: 22
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.md
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: typography.caption
  },
  metricValue: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
    fontWeight: "600"
  },
  caption: {
    color: colors.textMuted,
    fontSize: typography.caption
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  badge: {
    backgroundColor: colors.primarySoft,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: "hidden",
    textTransform: "capitalize",
    fontWeight: "500"
  }
});
