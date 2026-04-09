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

export function AgeScreen() {
  const [age, setAge] = useState("");
  const updateProfile = useCycleStore((state) => state.updateProfile);
  const navigation = useNavigation<any>();

  const handleNext = () => {
    const ageNum = parseInt(age, 10);
    if (ageNum > 0 && ageNum < 120) {
      updateProfile({ age: ageNum });
      navigation.navigate("CycleStats");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>Your age helps us fine-tune your health biological projections.</Text>
        
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="e.g., 25"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          autoFocus
        />

        <TouchableOpacity 
          style={[styles.button, (!age || parseInt(age) < 10) && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={!age || parseInt(age) < 10}
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
