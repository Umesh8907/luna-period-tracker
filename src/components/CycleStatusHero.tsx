import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  useAnimatedStyle,
  interpolate,
  Easing,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { colors, typography, spacing, radius } from "../theme/tokens";

const { width } = Dimensions.get("window");
const SIZE = width * 0.8;
const STROKE_WIDTH = 22;
const RADIUS = (SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PhaseArc {
  name: string;
  days: number;
  color: string;
  startAngle: number;
  sweepAngle: number;
}

interface Props {
  currentDay: number;
  totalDays: number;
  avgPeriodLength: number;
  phase: string;
  themeColor: string;
  nextPeriodDays: number;
  nextPeriodDate: string;
  onPhasePress: (phaseName: string) => void;
}

export function CycleStatusHero({ 
  currentDay, 
  totalDays, 
  avgPeriodLength,
  phase, 
  themeColor, 
  nextPeriodDays, 
  nextPeriodDate,
  onPhasePress 
}: Props) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  const formattedDate = new Date(nextPeriodDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Align strictly with predictionModel.ts logic
  const mDays = avgPeriodLength;
  const oDays = 5;
  const lDays = 11;
  const fDays = Math.max(0, totalDays - mDays - oDays - lDays);

  const phases = [
    { name: 'menstrual', days: mDays, color: colors.phaseMenstrual },
    { name: 'follicular', days: fDays, color: colors.phaseFollicular },
    { name: 'ovulatory', days: oDays, color: colors.phaseOvulatory },
    { name: 'luteal', days: lDays, color: colors.phaseLuteal },
  ];

  // Exactly totalDays now
  const totalPhaseDays = phases.reduce((acc, p) => acc + p.days, 0);
  
  let currentStartAngle = -90;
  const phaseArcs: PhaseArc[] = phases.map(p => {
    // Proportional sweep based on actual phase lengths
    const sweepAngle = (p.days / totalPhaseDays) * 360;
    const arc = { ...p, startAngle: currentStartAngle, sweepAngle };
    currentStartAngle += sweepAngle;
    return arc;
  });

  useEffect(() => {
    // Current day position relative to total cycle
    progress.value = withTiming((currentDay - 1) / totalDays, { 
      duration: 1500,
      easing: Easing.out(Easing.exp)
    });

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [currentDay, totalDays]);

  const tapGesture = Gesture.Tap().onEnd((event) => {
    // Center of the SVG
    const centerX = SIZE / 2;
    const centerY = SIZE / 2;
    
    // Relative tap coordinates
    const dx = event.x - centerX;
    const dy = event.y - centerY;
    
    // Distance from center check (only detect taps within the arc area)
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < RADIUS - STROKE_WIDTH * 2 || distance > RADIUS + STROKE_WIDTH * 2) return;

    // Calculate angle in degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize angle to start from -90 (top) and go 0-360 clockwise
    // atan2 returns -180 to 180. 
    // We want -90 to 270.
    if (angle < -90) {
      angle += 360;
    }
    
    // Scan phases to see where the tap landed
    let accumulatedAngle = -90;
    for (const arc of phaseArcs) {
        if (angle >= accumulatedAngle && angle <= accumulatedAngle + arc.sweepAngle) {
            runOnJS(onPhasePress)(arc.name);
            break;
        }
        accumulatedAngle += arc.sweepAngle;
    }
  });

  const rIndicatorStyle = useAnimatedStyle(() => {
    const angle = (progress.value * 360) - 90;
    const x = RADIUS * Math.cos(angle * (Math.PI / 180));
    const y = RADIUS * Math.sin(angle * (Math.PI / 180));
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: pulse.value }
      ],
      backgroundColor: themeColor,
      shadowColor: themeColor,
    };
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          <G rotation={0} origin={`${SIZE / 2}, ${SIZE / 2}`}>
            {phaseArcs.map((arc, i) => {
              const GAP = 2; // Minimal gaps
              const dashLength = (arc.sweepAngle / 360) * CIRCUMFERENCE - (GAP / 360 * CIRCUMFERENCE);
              const dashArray = [ Math.max(1, dashLength), CIRCUMFERENCE ];
              
              const dashOffset = - (arc.startAngle) / 360 * CIRCUMFERENCE;
              
              return (
                <Circle
                  key={arc.name}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={arc.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </G>
        </Svg>

        <Animated.View style={[styles.indicator, rIndicatorStyle]} />

        <View style={styles.content}>
          <Text style={styles.dayLabel}>Day</Text>
          <Text style={styles.dayNumber}>{currentDay}</Text>
          <View style={[styles.phaseBadge, { backgroundColor: themeColor + '20' }]}>
              <Text style={[styles.phaseLabel, { color: themeColor }]}>{phase}</Text>
          </View>
          <Text style={styles.countdown}>
              {nextPeriodDays} days until period
          </Text>
          <Text style={styles.dateLabel}>
              Expected: {formattedDate}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: spacing.lg,
  },
  svg: {
    position: "absolute",
    zIndex: 1,
  },
  indicator: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 10,
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    left: SIZE / 2 - 12,
    top: SIZE / 2 - 12,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    backgroundColor: colors.surface + '80', // Glassmorphism-ish background
    width: RADIUS * 1.5,
    height: RADIUS * 1.5,
    borderRadius: RADIUS,
  },
  dayLabel: {
    fontSize: 14,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
  },
  dayNumber: {
    fontSize: 72,
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
    fontSize: 14,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  countdown: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.8
  }
});
