import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDatabase } from "@/src/db/db";
import { WorkoutProvider } from "@/src/context/WorkoutContext";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
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
      </Stack>
      <StatusBar style="auto" />
    </WorkoutProvider>
  );
}
