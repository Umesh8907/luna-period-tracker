import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../theme/tokens";

interface PasswordInputProps extends TextInputProps {
  // Add any additional props if needed
}

export function PasswordInput(props: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setShowPassword(!showPassword)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center"
  },
  input: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingRight: spacing.xl + spacing.md, // Make room for the toggle button
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.body,
    color: colors.text
  },
  toggle: {
    position: "absolute",
    right: spacing.md,
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }
});
