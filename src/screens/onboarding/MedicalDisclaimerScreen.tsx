import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, typography, radius } from "../../theme/tokens";
import { Ionicons } from "@expo/vector-icons";

export function MedicalDisclaimerScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={64} color={colors.primary} />
        </View>
        
        <Text style={styles.title}>Welcome to Luna</Text>
        <Text style={styles.subtitle}>Important medical information</Text>
        
        <View style={styles.card}>
          <Text style={styles.body}>
            Luna is a tool for tracking and predicting cycles based on user input. It is designed for wellness and informational purposes only.
          </Text>
          
          <View style={styles.point}>
            <Ionicons name="close-circle" size={18} color={colors.danger} />
            <Text style={styles.pointText}>Luna is NOT a medical device.</Text>
          </View>
          
          <View style={styles.point}>
            <Ionicons name="close-circle" size={18} color={colors.danger} />
            <Text style={styles.pointText}>Luna is NOT a contraceptive or diagnostic tool.</Text>
          </View>

          <View style={styles.point}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.pointText}>Always consult a healthcare provider for medical advice or concerns about your health.</Text>
          </View>
        </View>

        <Text style={styles.agreementText}>
          By continuing, you acknowledge that you have read and understood this disclaimer.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate("Name")}
        >
          <Text style={styles.buttonText}>I Understand & Agree</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 80,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    gap: spacing.md,
  },
  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  point: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  agreementText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
    fontStyle: "italic",
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
