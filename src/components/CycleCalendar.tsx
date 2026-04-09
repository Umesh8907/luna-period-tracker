import React, { useMemo } from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/tokens";
import { CycleEntry, UserProfile } from "../features/cycle/types";
import { predictNextCycle } from "../features/ai/predictionModel";
import { formatISO, subMonths, addMonths } from "../lib/date";

interface Props {
  profile: UserProfile;
  entries: CycleEntry[];
  onSelectDate?: (date: string) => void;
  selectedDate?: string;
}

export function CycleCalendar({ profile, entries, onSelectDate, selectedDate }: Props) {
  const today = useMemo(() => formatISO(new Date()), []);
  const prediction = useMemo(() => predictNextCycle(profile, entries), [profile, entries]);
  
  // Restricted limits: 5 months past, 1 month future
  const minDate = useMemo(() => subMonths(today, 5), [today]);
  const maxDate = useMemo(() => addMonths(today, 1), [today]);

  const markedDates = useMemo(() => {
    const marks: any = {};

    // 1. First Pass: Map all Prediction Phases (The Timeline Layer)
    prediction.phases.forEach((p) => {
      marks[p.date] = {
        phase: p.phase,
        isPredictedPeriod: p.isPredictedPeriod,
        isOvulationPeak: p.isOvulationPeak,
        isLoggedPeriod: false, // Will be overridden if entry exists
        isSelected: p.date === selectedDate,
        isToday: p.date === today
      };
    });

    // 2. Second Pass: Hard-Map all Logged Entries (The Truth Layer)
    // This ensures that even dates outside the AI window show your logged circles.
    entries.forEach((entry) => {
      marks[entry.date] = {
        ...marks[entry.date], // Preserve phase/peak info if it exists
        isLoggedPeriod: entry.isPeriodDay,
        isSelected: entry.date === selectedDate,
        isToday: entry.date === today,
        // Fallback for phase if outside prediction window
        phase: marks[entry.date]?.phase || (entry.isPeriodDay ? 'menstrual' : 'unknown')
      };
    });

    return marks;
  }, [entries, prediction, today, selectedDate]);

  const renderDay = ({ date, state, marking }: any) => {
    const dayMark = marking || {};
    const isSelected = dayMark.isSelected;
    const isLoggedPeriod = dayMark.isLoggedPeriod;
    const isPredictedPeriod = dayMark.isPredictedPeriod && !isLoggedPeriod;
    const isOvulationPeak = dayMark.isOvulationPeak;
    const isToday = dayMark.isToday;
    const disabled = state === 'disabled' || (date.dateString < minDate) || (date.dateString > maxDate);

    return (
      <TouchableOpacity 
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.dayContainer,
          isLoggedPeriod && styles.dayLogged,
          isPredictedPeriod && styles.dayPredicted,
          isOvulationPeak && !isLoggedPeriod && styles.dayOvulation,
          isSelected && styles.daySelected,
          disabled && { opacity: 0.15 }
        ]}
        onPress={() => onSelectDate?.(date.dateString)}
      >
        <Text style={[
          styles.dayText,
          isLoggedPeriod && { color: '#FFF' },
          isOvulationPeak && !isLoggedPeriod && { color: colors.phaseOvulatory },
          isToday && !isLoggedPeriod && { color: colors.primary, textDecorationLine: 'underline' }
        ]}>
          {date.day}
        </Text>
        
        {/* Simplified Icons */}
        <View style={styles.iconLayer}>
          {isLoggedPeriod && <Ionicons name="water" size={8} color="#FFF" />}
          {isOvulationPeak && !isLoggedPeriod && <Ionicons name="sparkles" size={8} color={colors.phaseOvulatory} />}
        </View>

        {/* Phase Timeline Indicator */}
        {!isLoggedPeriod && !isPredictedPeriod && !disabled && (
          <View style={[styles.phaseDot, { backgroundColor: getPhaseColor(dayMark.phase) }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outerContainer}>
       <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: colors.phaseMenstrual }]} />
          <Text style={styles.legendLabel}>Logged</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.dashedIndicator]} />
          <Text style={styles.legendLabel}>Predicted</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { borderColor: colors.phaseOvulatory, borderWidth: 1.5, backgroundColor: 'transparent' }]} />
          <Text style={styles.legendLabel}>Ovulation</Text>
        </View>
      </View>

      <Calendar
        minDate={minDate}
        maxDate={maxDate}
        theme={{
          calendarBackground: 'transparent',
          textSectionTitleColor: colors.textMuted,
          monthTextColor: colors.text,
          textMonthFontSize: 20,
          textMonthFontWeight: "800",
          textDayHeaderFontSize: 11,
          textDayHeaderFontWeight: "600",
          arrowColor: colors.primary,
        }}
        markedDates={markedDates}
        dayComponent={renderDay}
        enableSwipeMonths={true}
      />
    </View>
  );
}

function getPhaseColor(phase: string) {
  switch(phase) {
    case 'menstrual': return colors.phaseMenstrual + "44";
    case 'follicular': return colors.phaseFollicular + "44";
    case 'ovulatory': return colors.phaseOvulatory + "44";
    case 'luteal': return colors.phaseLuteal + "44";
    default: return 'transparent';
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    elevation: 4,
    shadowColor: "#2B1F1A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  dayContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    marginVertical: 4,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  dayLogged: {
    backgroundColor: colors.phaseMenstrual,
  },
  dayPredicted: {
    borderWidth: 1.5,
    borderColor: colors.phaseMenstrual,
    borderStyle: 'dashed',
    backgroundColor: colors.phaseMenstrual + "10"
  },
  dayOvulation: {
    borderWidth: 1.5,
    borderColor: colors.phaseOvulatory,
  },
  daySelected: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  iconLayer: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  phaseDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendIndicator: { width: 12, height: 12, borderRadius: 6 },
  dashedIndicator: { borderWidth: 1, borderColor: colors.phaseMenstrual, borderStyle: 'dashed' },
  legendLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }
});
