import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { addDays, daysBetween } from "./date";
import { PHASE_METADATA } from "../features/ai/predictionModel";

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

export async function syncAllNotifications(prediction: any, hasLoggedToday: boolean) {
  // 1. Clear existing to prevent duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date().toISOString().slice(0, 10);
  console.log("[Notifications] Syncing for today:", today);

  // 2. Schedule Phase Transitions
  // We look at the phases in the prediction and find the first day of each phase
  const futurePhases = prediction.phases.filter((p: any) => p.date > today);
  const phaseStarts: Record<string, string> = {};
  
  futurePhases.forEach((p: any) => {
    if (!phaseStarts[p.phase]) {
      phaseStarts[p.phase] = p.date;
    }
  });

  for (const [phase, startDate] of Object.entries(phaseStarts)) {
    const daysUntil = daysBetween(today, startDate);
    if (daysUntil > 0 && daysUntil < 30) {
      const meta = PHASE_METADATA[phase as any];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `New Phase: ${meta.name} 🌙`,
          body: `You've entered your ${meta.name}. ${meta.brief}`,
          data: { screen: "Log" },
        },
        trigger: {
          seconds: daysUntil * 24 * 60 * 60,
        },
      });
    }
  }

  // 3. Period Reminder (2 days before)
  const daysUntilPeriod = daysBetween(today, prediction.nextPeriodDate);
  if (daysUntilPeriod > 2) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Cycle Reminder 🌸",
        body: "Your period is expected in 2 days. Time for some extra self-care.",
      },
      trigger: {
        seconds: (daysUntilPeriod - 2) * 24 * 60 * 60,
      },
    });
  }

  // 4. Daily Wellness Nudge (Recurring at 8 PM)
  // On most platforms, we schedule a recurring trigger
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Wellness Check-in 🌙",
      body: "How are you feeling today? Tap to log your symptoms.",
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    } as any,
  });
}
