import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  interpolateColor,
  useDerivedValue
} from "react-native-reanimated";
import { colors, typography, spacing } from "../theme/tokens";

const { width } = Dimensions.get("window");
const SIZE = width * 0.7;
const STROKE_WIDTH = 20;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  currentDay: number;
  totalDays: number;
  phase: string;
}

export function CycleCircle({ currentDay, totalDays, phase }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(currentDay / totalDays, { duration: 1500 });
  }, [currentDay, totalDays]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value)
  }));

  const animatedTextOpacity = useDerivedValue(() => {
    return withTiming(progress.value > 0 ? 1 : 0, { duration: 1000 });
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.primarySoft} />
          </LinearGradient>
        </Defs>
        {/* Background Circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.surfaceAlt}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="url(#grad)"
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
        <Text style={styles.phaseLabel}>{phase}</Text>
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
    marginVertical: spacing.lg
  },
  svg: {
    position: "absolute"
  },
  content: {
    justifyContent: "center",
    alignItems: "center"
  },
  dayLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontWeight: "600"
  },
  dayNumber: {
    fontSize: 64,
    fontWeight: "800",
    color: colors.text,
    marginVertical: -spacing.xs
  },
  phaseLabel: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: "600",
    marginTop: spacing.xs
  }
});
