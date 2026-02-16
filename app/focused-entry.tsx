import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { useExerciseHistory } from "@/src/hooks/useExerciseHistory";

export default function FocusedEntryScreen() {
  const router = useRouter();
  const { exerciseId, exerciseName } = useLocalSearchParams<{
    exerciseId: string;
    exerciseName: string;
  }>();

  const { logSet, exercises } = useWorkout();
  const numericExerciseId = Number(exerciseId);

  const exercise = exercises.find((ex) => ex.id === numericExerciseId);
  const currentSetIndex = exercise?.sets.length ?? 0;

  const { getGhostForSet } = useExerciseHistory(exerciseName ?? "");
  const ghost = getGhostForSet(currentSetIndex);

  const lastSet = exercise?.sets[exercise.sets.length - 1];
  const [weight, setWeight] = useState(lastSet?.weight.toString() ?? "");
  const [reps, setReps] = useState(lastSet?.reps.toString() ?? "");

  function handleLogSet() {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (r === 0) return;

    logSet(numericExerciseId, w, r);
    // Keep values pre-filled for next set
  }

  function handleFinish() {
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <Text className="text-lg font-semibold text-gray-500 mb-1">
          {exerciseName}
        </Text>
        <Text className="text-4xl font-bold text-gray-900 mb-6">
          Set {currentSetIndex + 1}
        </Text>

        <View className="flex-1 justify-center gap-4">
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Weight (lbs)
            </Text>
            <TextInput
              className="text-5xl font-bold text-gray-900 text-center w-full"
              value={weight}
              onChangeText={setWeight}
              placeholder={ghost ? String(ghost.weight) : "0"}
              placeholderTextColor="#D1D5DB"
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>

          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Reps
            </Text>
            <TextInput
              className="text-5xl font-bold text-gray-900 text-center w-full"
              value={reps}
              onChangeText={setReps}
              placeholder={ghost ? String(ghost.reps) : "0"}
              placeholderTextColor="#D1D5DB"
              keyboardType="number-pad"
              selectTextOnFocus
            />
          </View>
        </View>

        <View className="gap-3 mb-4">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center"
            activeOpacity={0.8}
            onPress={handleLogSet}
          >
            <Text className="text-white text-lg font-semibold">Log Set</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl py-4 items-center border border-gray-200"
            activeOpacity={0.8}
            onPress={handleFinish}
          >
            <Text className="text-gray-700 text-lg font-semibold">
              Finish Exercise
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
