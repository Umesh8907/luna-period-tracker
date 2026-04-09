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
      <View style={[styles.stickyHeader, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Health Insights</Text>
            <Text style={styles.subtitle}>Analyzing your cycle patterns ✨</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

        <Card title="Energy Trend" eyebrow="Last 7 Logs">
          <View style={styles.chartWrapper}>
            <LineChart
              data={energyData}
              color={colors.primary}
              thickness={4}
              dataPointsColor={colors.primary}
              dataPointsRadius={4}
              areaChart
              startFillColor={colors.primary}
              startOpacity={0.2}
              endOpacity={0.01}
              curved
              width={width - spacing.xl * 3}
              hideRules
              initialSpacing={20}
              spacing={40}
              noOfSections={2}
              maxValue={3}
              yAxisColor="transparent"
              xAxisColor={colors.border}
              yAxisLabelTexts={['Low', 'Med', 'High']}
              yAxisTextStyle={{ color: colors.textMuted, fontSize: 10, fontWeight: "600" }}
              xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10, fontWeight: "600" }}
              hideDataPoints={false}
              labelRotation={-45}
            />
          </View>
        </Card>

        <Card title="Cycle History" eyebrow="Duration in Days">
          {barData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <BarChart
                data={barData}
                barWidth={32}
                spacing={24}
                noOfSections={3}
                maxValue={45}
                barBorderRadius={6}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                yAxisLabelTexts={['0d', '15d', '30d', '45d']}
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 10, fontWeight: "600" }}
                xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10, fontWeight: "600" }}
                width={width - spacing.xl * 3}
                isAnimated
                animationDuration={1000}
              />
            </View>
          ) : (
            <Text style={styles.body}>Insufficient data to show cycle history. Keep logging!</Text>
          )}
        </Card>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Personalized Guidance</Text>
        </View>

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
            <View style={[styles.cardFooter, insight.type === "prediction" && styles.onAccentFooter]}>
              <Text style={insight.type === "prediction" ? styles.onAccentTextMuted : styles.caption}>
                Confidence: {insight.confidence}
              </Text>
            </View>
          </Card>
        ))}
        <View style={{ height: 100 }} />
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
    gap: spacing.lg
  },
  stickyHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "11",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    marginTop: 2
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primarySoft
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800"
  },
  chartWrapper: {
    marginTop: spacing.sm,
    paddingLeft: spacing.xs,
    overflow: "hidden"
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: -spacing.xs
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
    opacity: 0.9
  },
  onAccentText: {
    color: "#fff",
    fontSize: typography.body,
    lineHeight: 24,
    fontWeight: "500"
  },
  onAccentTextMuted: {
    color: "#fff",
    opacity: 0.7,
    fontSize: typography.caption,
    fontWeight: "600"
  },
  cardFooter: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  onAccentFooter: {
    borderTopColor: "rgba(255,255,255,0.2)"
  },
  caption: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "600",
    textTransform: "uppercase"
  }
});
