import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, typography, radius } from "../theme/tokens";
import { useCycleStore } from "../store/useCycleStore";
import { useAuthStore } from "../features/auth/useAuthStore";
import { Card } from "../components/Card";

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { profile, seedDummyData } = useCycleStore();
  const { signOut, user } = useAuthStore();

  const handleSeed = () => {
    Alert.alert(
      "Reset & Seed Data",
      "This will permanently delete all your logs and replace them with dummy data. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Reset Everything", style: "destructive", onPress: () => seedDummyData() }
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
          <Text style={styles.userName}>{profile.name || "Luna User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <StatBox label="Cycle Avg" value={`${profile.averageCycleLength}d`} />
          <StatBox label="Period Avg" value={`${profile.averagePeriodLength}d`} />
        </View>

        {/* Action List */}
        <View style={styles.actionSection}>
          <ActionItem 
            icon="settings-outline" 
            label="App Settings" 
            onPress={() => navigation.navigate("Settings")} 
          />
          <ActionItem 
            icon="flask-outline" 
            label="Maintenance: Seed Data" 
            onPress={handleSeed}
            color={colors.primary}
          />
          <ActionItem 
            icon="log-out-outline" 
            label="Sign Out" 
            onPress={signOut}
            color={colors.danger}
            hideBorder
          />
        </View>

        <Text style={styles.versionText}>Luna Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionItem({ icon, label, onPress, color = colors.text, hideBorder }: { icon: any; label: string; onPress: () => void; color?: string; hideBorder?: boolean }) {
  return (
    <TouchableOpacity 
      style={[styles.actionItem, !hideBorder && styles.borderBottom]} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.actionLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  backButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },
  actionSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  versionText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
  }
});
