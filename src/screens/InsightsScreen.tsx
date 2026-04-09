import React from "react";
import { ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LineChart, BarChart } from "react-native-gifted-charts";
import { Card } from "../components/Card";
import { useCycleStore } from "../store/useCycleStore";
import { buildInsights } from "../features/ai/insightEngine";
import { colors, spacing, typography, radius } from "../theme/tokens";
import { getCycleHistory } from "../lib/analytics";

const { width } = Dimensions.get("window");

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, entries } = useCycleStore();
  const insights = buildInsights(profile, entries);

  // Map energy logs to chart data
  const energyData = entries
    .slice(-7) // last 7 logs
    .reverse()
    .map((entry, index) => ({
      value: entry.symptoms.energy === "high" ? 3 : entry.symptoms.energy === "medium" ? 2 : 1,
      label: entry.date.slice(5) // MM-DD
    }));

  const cycleHistory = getCycleHistory(entries);
  const barData = cycleHistory.slice(-6).map(c => ({
    value: c.length,
    label: c.startDate.slice(5),
    frontColor: c.length > 32 || c.length < 24 ? colors.warning : colors.primary,
  }));

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Insights</Text>
          <Text style={styles.subtitle}>AI-driven patterns and wellness guidance.</Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Energy Trend (Last 7 Logs)</Text>
          <LineChart
            data={energyData}
            color={colors.primary}
            thickness={3}
            dataPointsColor={colors.primary}
            areaChart
            startFillColor={colors.primarySoft}
            startOpacity={0.4}
            endOpacity={0.1}
            curved
            width={width - spacing.xl * 2}
            hideRules
            initialSpacing={10}
            noOfSections={3}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            yAxisLabelTexts={['','Low', 'Med', 'High']}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Cycle Length History (Days)</Text>
          {barData.length > 0 ? (
            <BarChart
              data={barData}
              barWidth={22}
              noOfSections={3}
              barBorderRadius={4}
              frontColor={colors.primary}
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              yAxisLabelTexts={['0', '15', '30', '45']}
              yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
              width={width - spacing.xl * 2}
            />
          ) : (
            <Text style={styles.body}>Insufficient data to show cycle history. Keep logging!</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Personalized Guidance</Text>
        {insights.map((insight) => (
          <Card 
            key={insight.id} 
            eyebrow={insight.type.toUpperCase()} 
            title={insight.title}
            tone={insight.type === "prediction" ? "accent" : "default"}
          >
            <Text style={insight.type === "prediction" ? styles.onAccentText : styles.body}>
              {insight.summary}
            </Text>
            <View style={styles.footer}>
              <Text style={insight.type === "prediction" ? styles.onAccentTextMuted : styles.caption}>
                Confidence: {insight.confidence}
              </Text>
            </View>
          </Card>
        ))}
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
  header: {
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  chartContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  chartTitle: {
    fontSize: typography.caption,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: "uppercase"
  },
  sectionTitle: {
    fontSize: typography.heading,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  onAccentText: {
    color: "#fff",
    fontSize: typography.body,
    lineHeight: 22
  },
  onAccentTextMuted: {
    color: "#fff",
    opacity: 0.8,
    fontSize: typography.caption,
    marginTop: spacing.sm
  },
  footer: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs
  },
  caption: {
    color: colors.textMuted,
    fontSize: typography.caption
  }
});
