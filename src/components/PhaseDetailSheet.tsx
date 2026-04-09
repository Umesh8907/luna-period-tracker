import React, { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.55;

export interface PhaseDetailSheetProps {
  isVisible: boolean;
  onClose: () => void;
  phase: {
    name: string;
    description: string;
    recommendation: string;
    icon: string;
    brief: string;
    focus: string;
    social: string;
    color: string;
  } | null;
}

export function PhaseDetailSheet({ isVisible, onClose, phase }: PhaseDetailSheetProps) {
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(MAX_TRANSLATE_Y, { 
        damping: 50,
        stiffness: 300,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      });
    } else {
      translateY.value = withSpring(0, { 
        damping: 50,
        stiffness: 300,
        mass: 1
      });
    }
  }, [isVisible]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y - 50);
    })
    .onEnd((event) => {
      if (translateY.value > -SCREEN_HEIGHT / 3 || event.velocityY > 500) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { 
          damping: 50,
          stiffness: 300 
        });
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateY.value,
        [0, MAX_TRANSLATE_Y],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  if (!phase) return null;

  return (
    <>
      <Animated.View 
        pointerEvents={isVisible ? "auto" : "none"}
        style={[styles.backdrop, rBackdropStyle]}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <View style={styles.line} />
          
          <ScrollViewWithHeader phase={phase} />
        </Animated.View>
      </GestureDetector>
    </>
  );
}

function ScrollViewWithHeader({ phase }: { phase: any }) {
    return (
        <View style={styles.content}>
            <View style={styles.header}>
              <View style={[styles.iconBox, { backgroundColor: phase.color + '20' }]}>
                <Ionicons name={phase.icon} size={32} color={phase.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.phaseTitle, { color: phase.color }]}>{phase.name}</Text>
                <Text style={styles.phaseBrief}>{phase.brief}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Section title="Overview" content={phase.description} icon="information-circle-outline" />
            <Section title="Wellness Advice" content={phase.recommendation} icon="fitness-outline" />
            
            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <Ionicons name="bulb-outline" size={20} color={colors.textMuted} />
                    <Text style={styles.gridLabel}>FOCUS</Text>
                    <Text style={styles.gridValue}>{phase.focus}</Text>
                </View>
                <View style={styles.gridItem}>
                    <Ionicons name="people-outline" size={20} color={colors.textMuted} />
                    <Text style={styles.gridLabel}>SOCIAL</Text>
                    <Text style={styles.gridValue}>{phase.social}</Text>
                </View>
            </View>
        </View>
    );
}

function Section({ title, content, icon }: { title: string, content: string, icon: any }) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name={icon} size={18} color={colors.textMuted} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={styles.sectionContent}>{content}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: "100%",
    backgroundColor: colors.surface,
    position: "absolute",
    top: SCREEN_HEIGHT,
    zIndex: 1000,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  line: {
    width: 60,
    height: 6,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginVertical: 15,
    borderRadius: 3,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  content: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  phaseBrief: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  }
});
