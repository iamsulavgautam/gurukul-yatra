import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { LogBox } from "react-native";
import { useFonts } from "expo-font";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "GTWalsheimPro-Regular": require("../assets/fonts/GTWalsheimPro-Regular.ttf"),
    "GTWalsheimPro-Medium": require("../assets/fonts/GTWalsheimPro-Medium.ttf"),
    "TT-Octosquares-Medium": require("../assets/fonts/TT-Octosquares-Medium.ttf"),
  });

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    
    if (loaded) {
      console.log("✅ Fonts Loaded Successfully");
      SplashScreen.hideAsync();
    } else if (error) {
      console.error("❌ Font Loading Error:", error);
      SplashScreen.hideAsync(); // Hide splash even if there's an error
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null; // Prevent rendering until fonts are loaded
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="/(routes)/onboarding/index" />
      </Stack>
    </ToastProvider>
  );
}
