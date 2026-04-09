import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/tokens";
import { useCycleStore } from "../store/useCycleStore";

export function HeaderProfile() {
  const navigation = useNavigation<any>();
  const { profile } = useCycleStore();

  // Get initial or generic icon
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : null;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => navigation.navigate("Profile")}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        {initial ? (
          <Text style={styles.initialText}>{initial}</Text>
        ) : (
          <Ionicons name="person" size={18} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  initialText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  }
});
