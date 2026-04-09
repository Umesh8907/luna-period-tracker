import React, { useMemo, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, RefreshControl, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  withTiming, 
  interpolateColor,
  useDerivedValue
} from "react-native-reanimated";

import { useCycleStore } from "../store/useCycleStore";
import { predictNextCycle, getPhaseForDate, PHASE_METADATA, CyclePhase } from "../features/ai/predictionModel";
import { daysBetween, formatLongDate, getTodayISO } from "../lib/date";
import { colors, radius, spacing, typography } from "../theme/tokens";
import { CycleStatusHero } from "../components/CycleStatusHero";
import { HealthInsightCard } from "../components/HealthInsightCard";

const { width } = Dimensions.get("window");

const PHASE_THEMES: Record<CyclePhase, string> = {
  menstrual: "#E96479",
  follicular: "#7DB9B6",
  ovulatory: "#F9D949",
  luteal: "#8294C4",
  unknown: colors.primary
};

function DailyBriefItem({ icon, label, value, themeColor }: { icon: any; label: string; value: string; themeColor: string }) {
  return (
    <View style={styles.briefItem}>
      <View style={[styles.briefIcon, { backgroundColor: themeColor + '15' }]}>
        <Ionicons name={icon} size={16} color={themeColor} />
      </View>
      <View>
        <Text style={styles.briefLabel}>{label}</Text>
        <Text style={styles.briefValue}>{value}</Text>
      </View>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile, entries, loading, fetchData } = useCycleStore();
  
  const today = useMemo(() => getTodayISO(), []);
  const prediction = useMemo(() => predictNextCycle(profile, entries), [profile, entries]);
  
  const currentPhase = getPhaseForDate(today, prediction, entries);
  const phaseInfo = PHASE_METADATA[currentPhase];
  const themeColor = PHASE_THEMES[currentPhase];
  const hasLoggedToday = entries.some(e => e.date === today);

  const daysSinceStart = daysBetween(profile.lastPeriodStart, today);
  const currentDay = Math.max(1, (daysSinceStart % profile.averageCycleLength) + 1);
  const daysLeft = daysBetween(today, prediction.nextPeriodDate);

  // Animated background color
  const backgroundColor = useDerivedValue(() => {
    return withTiming(themeColor, { duration: 1000 });
  });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value + '08', // Very subtle tint
  }));

  return (
    <View style={styles.screen}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={themeColor} />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.name}>{profile.name} ✨</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(300).duration(800)}>
          <CycleStatusHero 
            currentDay={currentDay}
            totalDays={profile.averageCycleLength}
            phase={phaseInfo.name}
            themeColor={themeColor}
            nextPeriodDays={daysLeft}
          />
        </Animated.View>

        {/* Quick Log Action */}
        {!hasLoggedToday && (
          <Animated.View entering={FadeInDown.delay(500).duration(800)}>
            <TouchableOpacity 
              style={[styles.quickLogCard, { borderColor: themeColor + '40' }]} 
              onPress={() => navigation.navigate("DailyLog")}
            >
              <View style={[styles.quickLogIcon, { backgroundColor: themeColor }]}>
                <Ionicons name="pencil" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickLogTitle}>How are you feeling?</Text>
                <Text style={styles.quickLogSubtitle}>Log your symptoms for better insights</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={themeColor} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Daily Insights Section */}
        <Animated.View entering={FadeInDown.delay(700).duration(800)}>
          <Text style={styles.sectionTitle}>Daily Guidance</Text>
          <View style={styles.briefGrid}>
            <DailyBriefItem 
              icon="bulb" 
              label="Focus" 
              value={phaseInfo.focus} 
              themeColor={themeColor} 
            />
            <DailyBriefItem 
              icon="people" 
              label="Social" 
              value={phaseInfo.social} 
              themeColor={themeColor} 
            />
          </View>
        </Animated.View>

        {/* Health Insights */}
        <Animated.View entering={FadeInDown.delay(900).duration(800)}>
          <Text style={styles.sectionTitle}>For You</Text>
          <HealthInsightCard 
            title="Optimal Movement"
            description={phaseInfo.recommendation}
            icon="fitness"
            themeColor={themeColor}
          />
          <HealthInsightCard 
            title="Cycle Phase Guide"
            description={phaseInfo.brief}
            icon="information-circle"
            themeColor={themeColor}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "500",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  profileButton: {
    padding: 4,
  },
  quickLogCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: spacing.lg,
  },
  quickLogIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  quickLogTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  quickLogSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  briefGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  briefItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  briefIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  briefLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  briefValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "800",
  }
});
