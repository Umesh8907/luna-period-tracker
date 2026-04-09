import React from "react";
import { ScrollView, StyleSheet, Switch, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../components/Card";
import { useAuthStore } from "../features/auth/useAuthStore";
import { colors, spacing, typography, radius } from "../theme/tokens";
import { useCycleStore } from "../store/useCycleStore";
import { Alert } from "react-native";

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuthStore();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Privacy and consent should be first-class product features in a health app.</Text>

        <Card eyebrow="Current User" title={user?.email || "Signed In"}>
          <Text style={styles.body}>Your session is securely managed by Supabase.</Text>
        </Card>

        <Card eyebrow="Privacy" title="Sensitive data controls">
          <View style={styles.row}>
            <Text style={styles.body}>Biometric app lock</Text>
            <Switch value />
          </View>
          <View style={styles.row}>
            <Text style={styles.body}>Export data</Text>
            <Switch value={false} />
          </View>
          <View style={styles.row}>
            <Text style={styles.body}>Personalized AI insights</Text>
            <Switch value />
          </View>
        </Card>

        <Card eyebrow="Compliance" title="Production requirements">
          <Text style={styles.body}>Explicit consent for health data collection</Text>
          <Text style={styles.body}>Encrypted local storage and encrypted transport</Text>
          <Text style={styles.body}>Clear boundaries between wellness guidance and medical claims</Text>
        </Card>

        <Text style={styles.footerText}>Luna Version 1.0.0 (Production Candidate)</Text>
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
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  signOutButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    marginTop: spacing.lg
  },
  signOutText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "600"
  },
  seedButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    marginTop: spacing.sm
  },
  seedText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "700"
  },
  footerText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.md,
    marginBottom: spacing.xl
  }
});
