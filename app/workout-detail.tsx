import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack } from "expo-router";
import {
  getWorkoutById,
  getExercisesForWorkout,
  getSetsForExercise,
  ExerciseRow,
  SetRow,
} from "@/src/db/queries";

export default function WorkoutDetailScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const id = Number(workoutId);

  const workout = getWorkoutById(id);
  const exercises = workout ? getExercisesForWorkout(id) : [];

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ title: "Workout" }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-lg">Workout not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(workout.date);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const minutes = Math.floor(workout.duration / 60);
  const seconds = workout.duration % 60;
  const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: workout.name,
          headerShown: true,
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Header info */}
        <Text className="text-sm text-gray-500 mb-1">{dateStr}</Text>
        <Text className="text-3xl font-bold text-gray-900 mb-4">
          {workout.name}
        </Text>

        {/* Stats row */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 items-center">
            <Text className="text-sm font-bold uppercase text-gray-500 mb-1">
              Duration
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              {durationStr}
            </Text>
          </View>
          {workout.total_volume > 0 && (
            <View className="flex-1 bg-white rounded-xl p-4 items-center">
              <Text className="text-sm font-bold uppercase text-gray-500 mb-1">
                Volume
              </Text>
              <Text className="text-xl font-bold text-gray-900">
                {Math.round(workout.total_volume).toLocaleString()} lbs
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {workout.notes ? (
          <View className="bg-white rounded-xl p-4 mb-6">
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Notes
            </Text>
            <Text className="text-base text-gray-900">{workout.notes}</Text>
          </View>
        ) : null}

        {/* Exercises */}
        {exercises.map((exercise: ExerciseRow) => {
          const sets: SetRow[] = getSetsForExercise(exercise.id);
          const mt = exercise.metric_type || "weight_reps";
          const u = exercise.unit || "lbs";
          return (
            <View key={exercise.id} className="bg-white rounded-xl p-4 mb-3">
              <Text className="text-base font-bold text-gray-900">
                {exercise.name}
              </Text>
              <Text className="text-sm text-gray-500 mb-2">
                {exercise.muscle_group}
              </Text>
              {sets.map((set, index) => {
                let display = "";
                if (mt === "weight_reps") {
                  display = `${set.weight} ${u} × ${set.reps} reps`;
                } else if (mt === "bodyweight_reps") {
                  display = set.weight > 0
                    ? `BW + ${set.weight} ${u} × ${set.reps} reps`
                    : `BW × ${set.reps} reps`;
                } else if (mt === "distance") {
                  display = `${set.value} m`;
                } else if (mt === "time") {
                  display = `${set.value} s`;
                }
                return (
                  <Text key={set.id} className="text-sm text-gray-700 ml-2">
                    Set {index + 1}: {display}
                  </Text>
                );
              })}
              {sets.length === 0 && (
                <Text className="text-sm text-gray-400 ml-2">
                  No sets logged
                </Text>
              )}
            </View>
          );
        })}

        {exercises.length === 0 && (
          <View className="bg-white rounded-xl p-4">
            <Text className="text-gray-400 text-center">
              No exercises in this workout
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
