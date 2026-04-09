import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useCycleStore } from "../../store/useCycleStore";
import { colors, spacing, radius, typography } from "../../theme/tokens";
import { useNavigation } from "@react-navigation/native";

export function LastPeriodScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const updateProfile = useCycleStore((state) => state.updateProfile);
  const navigation = useNavigation<any>();

  const handleNext = () => {
    updateProfile({ lastPeriodStart: selectedDate });
    navigation.navigate("Goals");
  };

  const handleSkip = () => {
    // Default to today if skipped
    updateProfile({ lastPeriodStart: new Date().toISOString().slice(0, 10) });
    navigation.navigate("Goals");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Last Period</Text>
      <Text style={styles.subtitle}>When did your last period start? This helps us anchor your cycle timeline.</Text>

      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: colors.primary,
              selectedTextColor: "#fff"
            }
          }}
          theme={{
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textMuted,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: "#ffffff",
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            indicatorColor: colors.primary,
            textDayFontWeight: "400",
            textMonthFontWeight: "700",
            textDayHeaderFontWeight: "600",
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12
          }}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>I'm not sure, skip</Text>
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
  calendarContainer: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
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
