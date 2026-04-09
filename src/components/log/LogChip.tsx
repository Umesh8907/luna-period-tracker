import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme/tokens";

interface Props {
  id: string;
  label: string;
  icon: any;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
}

export function LogChip({ id, label, icon, isSelected, onPress, color = colors.primary }: Props) {
  return (
    <TouchableOpacity 
      style={[
        styles.chip, 
        isSelected && { 
            backgroundColor: color + '20', 
            borderColor: color 
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer, 
        isSelected && { backgroundColor: color }
      ]}>
        <Ionicons 
            name={icon} 
            size={16} 
            color={isSelected ? "#FFF" : colors.textMuted} 
        />
      </View>
      <Text style={[
        styles.label, 
        isSelected && { color: color, fontWeight: "800" }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceVariant,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  }
});
