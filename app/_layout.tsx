import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDatabase } from "@/src/db/db";
import { WorkoutProvider } from "@/src/context/WorkoutContext";
import "../global.css";

// Initialize DB at module load — before any component renders or queries
initDatabase();

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WorkoutProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="focused-entry"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="workout-detail"
            options={{
              headerShown: true,
              title: "Workout",
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </WorkoutProvider>
    </GestureHandlerRootView>
  );
}
