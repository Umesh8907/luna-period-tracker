import React, { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/tokens";

type CardProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  tone?: "default" | "accent";
}>;

export function Card({ eyebrow, title, tone = "default", children }: CardProps) {
  return (
    <View style={[styles.card, tone === "accent" && styles.accentCard]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  accentCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "700"
  },
  content: {
    gap: spacing.sm
  }
});
