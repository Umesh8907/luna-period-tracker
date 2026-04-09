import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { addDays, daysBetween } from "./date";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return false;
  }
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  return true;
}

export async function scheduleCycleReminders(nextPeriodDate: string, ovulationDate: string) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date().toISOString().slice(0, 10);

  // 1. Reminder 2 days before period
  const reminderDate = addDays(nextPeriodDate, -2);
  const daysUntilPeriodReminder = daysBetween(today, reminderDate);

  if (daysUntilPeriodReminder > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Cycle reminder 🌸",
        body: "Your next cycle is projected to start in 2 days. Time for some self-care!",
      },
      trigger: {
        seconds: daysUntilPeriodReminder * 24 * 60 * 60,
      },
    });
  }

  // 2. Ovulation reminder
  const daysUntilOvulation = daysBetween(today, ovulationDate);
  if (daysUntilOvulation > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Fertility Window 🌟",
        body: "You're entering your estimated fertile window. Ovulation is predicted soon.",
      },
      trigger: {
        seconds: daysUntilOvulation * 24 * 60 * 60,
      },
    });
  }
}
