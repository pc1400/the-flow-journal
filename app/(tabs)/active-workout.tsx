import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useWorkout, WorkoutExercise } from "@/src/context/WorkoutContext";
import { DraggableExerciseList } from "@/src/components/DraggableExerciseList";
import { ExerciseSearch } from "@/src/components/ExerciseSearch";
import { WorkoutSummaryModal } from "@/src/components/WorkoutSummaryModal";
import { NameInputModal } from "@/src/components/NameInputModal";
import { ExerciseDefinition } from "@/src/data/exercises";
import { getCompletedSetCount, getTotalVolume, saveWorkoutAsTemplate } from "@/src/db/queries";

type GroupedItem =
  | { type: "single"; exercise: WorkoutExercise }
  | { type: "superset"; group: number; exercises: WorkoutExercise[] };

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    isActive,
    exercises,
    addExercise,
    finishWorkout,
    startTime,
    workoutId,
    createSupersetFromExercises,
    removeSupersetGroup,
    reorderExercises,
  } = useWorkout();
  const [searchVisible, setSearchVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [frozenElapsed, setFrozenElapsed] = useState<number | null>(null);
  const [routineNameVisible, setRoutineNameVisible] = useState(false);
  const pendingSaveRef = useRef<{ name: string; notes: string; workoutId: number } | null>(null);

  const displayElapsed = frozenElapsed ?? elapsed;

  useEffect(() => {
    if (!isActive || !startTime || frozenElapsed !== null) {
      if (!isActive) setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime, frozenElapsed]);

  const hours = String(Math.floor(displayElapsed / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((displayElapsed % 3600) / 60)).padStart(2, "0");
  const seconds = String(displayElapsed % 60).padStart(2, "0");

  // Group exercises by supersetGroup for rendering
  const groupedItems = useMemo((): GroupedItem[] => {
    const items: GroupedItem[] = [];
    const seen = new Set<number>();

    for (const ex of exercises) {
      if (seen.has(ex.id)) continue;

      if (ex.supersetGroup != null) {
        const groupExercises = exercises.filter(
          (e) => e.supersetGroup === ex.supersetGroup
        );
        for (const ge of groupExercises) seen.add(ge.id);
        items.push({ type: "superset", group: ex.supersetGroup, exercises: groupExercises });
      } else {
        seen.add(ex.id);
        items.push({ type: "single", exercise: ex });
      }
    }

    return items;
  }, [exercises]);

  function handleSelectExercise(exercise: ExerciseDefinition) {
    addExercise(exercise.name, exercise.muscleGroup, exercise.metricType, exercise.defaultUnit);
  }

  const handleExercisePress = useCallback(
    (exerciseId: number, exerciseName: string) => {
      const ex = exercises.find((e) => e.id === exerciseId);
      router.push({
        pathname: "/focused-entry",
        params: {
          exerciseId: String(exerciseId),
          exerciseName,
          metricType: ex?.metricType ?? "weight_reps",
          unit: ex?.unit ?? "lbs",
          supersetGroup: ex?.supersetGroup != null ? String(ex.supersetGroup) : "",
        },
      });
    },
    [exercises, router]
  );

  const handleUngroupSuperset = useCallback(
    (exerciseIds: number[]) => {
      for (const id of exerciseIds) {
        removeSupersetGroup(id);
      }
    },
    [removeSupersetGroup]
  );

  const handleReorder = useCallback(
    (orderedIds: number[]) => {
      reorderExercises(orderedIds);
    },
    [reorderExercises]
  );

  const handleCreateSuperset = useCallback(
    (exerciseIds: number[]) => {
      createSupersetFromExercises(exerciseIds);
    },
    [createSupersetFromExercises]
  );

  function handleFinish() {
    setFrozenElapsed(elapsed);
    setSummaryVisible(true);
  }

  function handleSummaryClose() {
    setSummaryVisible(false);
    setFrozenElapsed(null);
  }

  function handleSummarySave(name: string, notes: string, saveAsRoutine: boolean) {
    const savedDuration = frozenElapsed ?? elapsed;

    if (saveAsRoutine && workoutId) {
      pendingSaveRef.current = { name, notes, workoutId };
      finishWorkout(name, notes, savedDuration);
      setSummaryVisible(false);
      setFrozenElapsed(null);
      setRoutineNameVisible(true);
    } else {
      finishWorkout(name, notes, savedDuration);
      setSummaryVisible(false);
      setFrozenElapsed(null);
      router.navigate("/(tabs)/");
    }
  }

  function handleRoutineNameConfirm(routineName: string) {
    if (pendingSaveRef.current) {
      saveWorkoutAsTemplate(pendingSaveRef.current.workoutId, routineName, "");
      pendingSaveRef.current = null;
    }
    setRoutineNameVisible(false);
    router.navigate("/(tabs)/");
  }

  function handleRoutineNameCancel() {
    pendingSaveRef.current = null;
    setRoutineNameVisible(false);
    router.navigate("/(tabs)/");
  }

  if (!isActive && !routineNameVisible) {
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

        <DraggableExerciseList
          groupedItems={groupedItems}
          onExercisePress={handleExercisePress}
          onUngroup={handleUngroupSuperset}
          onReorder={handleReorder}
          onCreateSuperset={handleCreateSuperset}
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

      <WorkoutSummaryModal
        visible={summaryVisible}
        onClose={handleSummaryClose}
        onSave={handleSummarySave}
        duration={displayElapsed}
        setCount={workoutId ? getCompletedSetCount(workoutId) : 0}
        totalVolume={workoutId ? getTotalVolume(workoutId) : 0}
        exerciseNames={exercises.map((ex) => ex.name)}
        defaultName="Workout"
      />

      <NameInputModal
        visible={routineNameVisible}
        title="Name Your Routine"
        defaultValue="My Routine"
        confirmLabel="Save Routine"
        onConfirm={handleRoutineNameConfirm}
        onCancel={handleRoutineNameCancel}
      />
    </SafeAreaView>
  );
}
