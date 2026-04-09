import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  useAnimatedStyle,
  interpolate,
  Easing
} from "react-native-reanimated";
import { colors, typography, spacing, radius } from "../theme/tokens";

const { width } = Dimensions.get("window");
const SIZE = width * 0.75;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  currentDay: number;
  totalDays: number;
  phase: string;
  themeColor: string;
  nextPeriodDays: number;
}

export function CycleStatusHero({ currentDay, totalDays, phase, themeColor, nextPeriodDays }: Props) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Reset and animate sweep
    progress.value = 0;
    progress.value = withTiming(currentDay / totalDays, { 
      duration: 2000,
      easing: Easing.out(Easing.exp)
    });

    // Suble continuous pulse
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [currentDay, totalDays]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value)
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.03], [0.9, 1])
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseContainer, animatedPulseStyle]}>
         <View style={[styles.glow, { backgroundColor: themeColor, opacity: 0.15 }]} />
      </Animated.View>

      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={themeColor} />
            <Stop offset="100%" stopColor={colors.surfaceAlt} />
          </LinearGradient>
        </Defs>
        
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.surfaceAlt}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeOpacity={0.3}
        />
        
        {/* Animated Progress */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={themeColor}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <View style={styles.content}>
        <Text style={styles.dayLabel}>Day</Text>
        <Text style={styles.dayNumber}>{currentDay}</Text>
        <View style={[styles.phaseBadge, { backgroundColor: themeColor + '20' }]}>
            <Text style={[styles.phaseLabel, { color: themeColor }]}>{phase}</Text>
        </View>
        <Text style={styles.countdown}>
            {nextPeriodDays} days until period
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: spacing.xl,
  },
  svg: {
    position: "absolute",
    zIndex: 1,
  },
  pulseContainer: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: RADIUS * 2,
    height: RADIUS * 2,
    borderRadius: RADIUS,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  dayLabel: {
    fontSize: 14,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
  },
  dayNumber: {
    fontSize: 84,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -2,
    marginVertical: -spacing.xs,
  },
  phaseBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  phaseLabel: {
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  countdown: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  }
});
