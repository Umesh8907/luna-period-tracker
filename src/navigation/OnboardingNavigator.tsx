import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NameScreen } from "../screens/onboarding/NameScreen";
import { AgeScreen } from "../screens/onboarding/AgeScreen";
import { CycleStatsScreen } from "../screens/onboarding/CycleStatsScreen";
import { LastPeriodScreen } from "../screens/onboarding/LastPeriodScreen";
import { GoalsScreen } from "../screens/onboarding/GoalsScreen";

const Stack = createNativeStackNavigator();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: "slide_from_right"
      }}
    >
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Age" component={AgeScreen} />
      <Stack.Screen name="CycleStats" component={CycleStatsScreen} />
      <Stack.Screen name="LastPeriod" component={LastPeriodScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
    </Stack.Navigator>
  );
}
