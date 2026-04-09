import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../screens/HomeScreen";
import { DailyLogScreen } from "../screens/DailyLogScreen";
import { CycleLogScreen } from "../screens/CycleLogScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { useAuthStore } from "../features/auth/useAuthStore";
import { useCycleStore } from "../store/useCycleStore";
import { colors, spacing, typography } from "../theme/tokens";
import { ProfileScreen } from "../screens/ProfileScreen";
import { requestNotificationPermissions, syncAllNotifications } from "../lib/notifications";
import { predictNextCycle } from "../features/ai/predictionModel";
import { OnboardingNavigator } from "./OnboardingNavigator";

// We use NativeStack v6 with enableScreens(false) in App.tsx. This ensures that
// even with the "native" stack, it uses pure React view layers that we proved are responsive.
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary
  }
};

function TabIcon({ name, focused, color }: { name: any; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 10 }}>
      <Ionicons name={focused ? name : `${name}-outline` as any} size={24} color={color} />
      <View 
        style={{ 
          width: 4, 
          height: 4, 
          borderRadius: 2, 
          backgroundColor: focused ? color : 'transparent', 
          marginTop: 4 
        }} 
      />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: { 
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          paddingBottom: 0, 
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarIcon: (props) => <TabIcon name="home" {...props} /> 
        }} 
      />
      <Tab.Screen 
        name="DailyLog" 
        component={DailyLogScreen} 
        options={{ 
          tabBarIcon: (props) => <TabIcon name="journal" {...props} /> 
        }} 
      />
      <Tab.Screen 
        name="Calendar" 
        component={CycleLogScreen} 
        options={{ 
          tabBarIcon: (props) => <TabIcon name="calendar" {...props} /> 
        }} 
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{ 
          tabBarIcon: (props) => <TabIcon name="analytics" {...props} /> 
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarIcon: (props) => <TabIcon name="person" {...props} /> 
        }} 
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { session, loading, initialize } = useAuthStore();
  const { profile, entries, fetchData, isInitialized } = useCycleStore();

  console.log("[AppNavigator] Rendering... " + (session ? "Logged In" : "Logged Out"));

  useEffect(() => {
    initialize();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (session && !isInitialized) {
      console.log("[AppNavigator] Initial data fetch...");
      fetchData();
    }
  }, [session, isInitialized]);

  useEffect(() => {
    if (session && isInitialized && profile.hasCompletedOnboarding) {
      console.log("[AppNavigator] Syncing notifications...");
      const prediction = predictNextCycle(profile, entries);
      const today = new Date().toISOString().slice(0, 10);
      const hasLoggedToday = entries.some(e => e.date === today);
      syncAllNotifications(prediction, hasLoggedToday);
    }
  }, [session, isInitialized, profile, entries]);

  if (loading || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!session ? (
        <AuthStack />
      ) : !profile.hasCompletedOnboarding ? (
        <OnboardingNavigator />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
}
