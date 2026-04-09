import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useCycleStore } from "../../store/useCycleStore";
import { colors, spacing, radius, typography } from "../../theme/tokens";
import { useNavigation } from "@react-navigation/native";

export function NameScreen() {
  const [name, setName] = useState("");
  const updateProfile = useCycleStore((state) => state.updateProfile);
  const navigation = useNavigation<any>();

  const handleNext = () => {
    if (name.trim()) {
      updateProfile({ name: name.trim() });
      navigation.navigate("Age");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>Let's personalize your Luna experience.</Text>
        
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, !name && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!name}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg
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
  input: {
    fontSize: 24,
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.sm
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.xl
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "#fff",
    fontSize: typography.body,
    fontWeight: "600"
  }
});
