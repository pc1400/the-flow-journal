import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { getRecentWorkouts, WorkoutRow } from "@/src/db/queries";
import { Card } from "@/src/components/Card";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

export default function HistoryScreen() {
  const router = useRouter();
  const { startWorkout, isActive } = useWorkout();
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      setWorkouts(getRecentWorkouts());
    }, [])
  );

  function handleStartWorkout() {
    startWorkout("Workout");
    router.navigate("/(tabs)/active-workout");
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">
          The Flow Journal
        </Text>

        {!isActive && (
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mb-6"
            activeOpacity={0.8}
            onPress={handleStartWorkout}
          >
            <Text className="text-white text-lg font-semibold">
              Start Empty Workout
            </Text>
          </TouchableOpacity>
        )}

        {isActive && (
          <TouchableOpacity
            className="bg-white rounded-xl py-4 items-center mb-6 border-2 border-primary"
            activeOpacity={0.8}
            onPress={() => router.navigate("/(tabs)/active-workout")}
          >
            <Text className="text-primary text-lg font-semibold">
              Continue Workout
            </Text>
          </TouchableOpacity>
        )}

        <Text className="text-lg font-bold uppercase text-gray-500 mb-3">
          Recent Workouts
        </Text>

        <FlatList
          data={workouts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card className="mb-3">
              <Text className="text-base font-bold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {formatDate(item.date)} &middot; {formatDuration(item.duration)}{" "}
                &middot; {Math.round(item.total_volume).toLocaleString()} lbs
              </Text>
            </Card>
          )}
          ListEmptyComponent={
            <Card>
              <Text className="text-gray-400 text-center py-8">
                No workouts yet. Start your first flow!
              </Text>
            </Card>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          className="flex-1"
        />
      </View>
    </SafeAreaView>
  );
}
