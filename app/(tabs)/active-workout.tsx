import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { ExerciseCard } from "@/src/components/ExerciseCard";
import { ExerciseSearch } from "@/src/components/ExerciseSearch";
import { ExerciseDefinition } from "@/src/data/exercises";

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { isActive, exercises, addExercise, finishWorkout, startTime } =
    useWorkout();
  const [searchVisible, setSearchVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  function handleSelectExercise(exercise: ExerciseDefinition) {
    addExercise(exercise.name, exercise.muscleGroup);
  }

  function handleExercisePress(exerciseId: number, exerciseName: string) {
    router.push({
      pathname: "/focused-entry",
      params: { exerciseId: String(exerciseId), exerciseName },
    });
  }

  function handleFinish() {
    finishWorkout();
  }

  if (!isActive) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-5 pt-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            The Flow
          </Text>
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400 text-lg">
              No active workout
            </Text>
            <Text className="text-gray-400 mt-1">
              Start one from the History tab
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          The Flow
        </Text>

        <View className="bg-white rounded-xl p-4 mb-6 items-center shadow-sm">
          <Text className="text-sm font-bold uppercase text-gray-500 mb-1">
            Duration
          </Text>
          <Text className="text-4xl font-bold text-gray-900">
            {hours}:{minutes}:{seconds}
          </Text>
        </View>

        <FlatList
          data={exercises}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ExerciseCard
              name={item.name}
              muscleGroup={item.muscleGroup}
              setCount={item.sets.length}
              onPress={() => handleExercisePress(item.id, item.name)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-8">
              <Text className="text-gray-400">
                No exercises yet. Add one to begin.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          className="flex-1"
        />

        <View className="gap-3 mb-4">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
            activeOpacity={0.8}
            onPress={() => setSearchVisible(true)}
          >
            <Plus size={20} color="#fff" />
            <Text className="text-white text-lg font-semibold ml-2">
              Add Exercise
            </Text>
          </TouchableOpacity>

          {exercises.length > 0 && (
            <TouchableOpacity
              className="bg-white rounded-xl py-4 flex-row items-center justify-center border border-gray-200"
              activeOpacity={0.8}
              onPress={handleFinish}
            >
              <CheckCircle size={20} color="#22C55E" />
              <Text className="text-gray-700 text-lg font-semibold ml-2">
                Finish Workout
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ExerciseSearch
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelect={handleSelectExercise}
      />
    </SafeAreaView>
  );
}
