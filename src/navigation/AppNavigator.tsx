import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../screens/HomeScreen";
import { CycleLogScreen } from "../screens/CycleLogScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { useAuthStore } from "../features/auth/useAuthStore";
import { useCycleStore } from "../store/useCycleStore";
import { colors, spacing, typography } from "../theme/tokens";
import { ProfileScreen } from "../screens/ProfileScreen";
import { HeaderProfile } from "../components/HeaderProfile";
import { requestNotificationPermissions, scheduleCycleReminders } from "../lib/notifications";
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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true, // We want headers for the profile icon
        headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: "900", color: colors.text, fontSize: 18 },
        headerRight: () => <HeaderProfile />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: colors.border }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: "Luna",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="Log" 
        component={CycleLogScreen} 
        options={{ 
          title: "Cycle History",
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{ 
          title: "AI Insights",
          tabBarIcon: ({ color }) => <Ionicons name="analytics" size={24} color={color} /> 
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
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: "Settings" }} />
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
    if (session) {
      console.log("[AppNavigator] Fetching data...");
      fetchData();
    }
  }, [session]);

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
