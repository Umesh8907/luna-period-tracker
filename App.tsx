import 'react-native-url-polyfill/auto';
import { enableScreens } from 'react-native-screens';
/**
 * STABILITY FIX: We disable native screens to bypass a 'glass wall' touch-block issue 
 * found in this specific environment (RN 0.81 / iPhone). This forces the navigator 
 * to use pure React view layers, which ensures total touch responsiveness.
 */
enableScreens(false);

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          <AppNavigator />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
