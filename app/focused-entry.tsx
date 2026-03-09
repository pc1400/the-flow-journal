import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { useExerciseHistory } from "@/src/hooks/useExerciseHistory";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { RestTimer } from "@/src/components/RestTimer";

export default function FocusedEntryScreen() {
  const router = useRouter();
  const {
    exerciseId,
    exerciseName,
    metricType: paramMetricType,
    unit: paramUnit,
    supersetGroup: paramSupersetGroup,
    restTimerStartedAt: paramRestTimerStartedAt,
  } = useLocalSearchParams<{
    exerciseId: string;
    exerciseName: string;
    metricType: string;
    unit: string;
    supersetGroup: string;
    restTimerStartedAt: string;
  }>();

  const metricType = paramMetricType || "weight_reps";
  const unit = paramUnit || "lbs";
  const supersetGroup = paramSupersetGroup || "";

  const { logSet, exercises, updateExerciseUnit } = useWorkout();
  const numericExerciseId = Number(exerciseId);

  const exercise = exercises.find((ex) => ex.id === numericExerciseId);
  const sets = exercise?.sets ?? [];
  const activeSetIndex = sets.length;

  const { getGhostForSet } = useExerciseHistory(exerciseName ?? "");

  const [activePageIndex, setActivePageIndex] = useState(activeSetIndex);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [value, setValue] = useState("");
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(unit);

  const toggleUnit = useCallback(() => {
    const newUnit = selectedUnit === "lbs" ? "kg" : "lbs";
    setSelectedUnit(newUnit);
    updateExerciseUnit(numericExerciseId, newUnit);
  }, [selectedUnit, numericExerciseId, updateExerciseUnit]);

  // Superset auto-advance
  const supersetExercises = supersetGroup
    ? exercises.filter((ex) => ex.supersetGroup != null && String(ex.supersetGroup) === supersetGroup)
    : [];
  const currentIndexInSuperset = supersetExercises.findIndex((ex) => ex.id === numericExerciseId);
  const nextSupersetExercise =
    supersetExercises.length >= 2
      ? supersetExercises[(currentIndexInSuperset + 1) % supersetExercises.length]
      : null;

  // Auto-activate rest timer if navigated with restTimerStartedAt
  const [restTimerStartedAt, setRestTimerStartedAt] = useState<number | undefined>(
    paramRestTimerStartedAt ? Number(paramRestTimerStartedAt) : undefined
  );

  useEffect(() => {
    if (paramRestTimerStartedAt) {
      setRestTimerActive(true);
      setRestTimerStartedAt(Number(paramRestTimerStartedAt));
    }
  }, [paramRestTimerStartedAt]);

  // Animation values
  const counterScale = useSharedValue(1);
  const checkOpacity = useSharedValue(0);

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: counterScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  // Snap to the active set when a new set is logged
  useEffect(() => {
    setActivePageIndex(activeSetIndex);
    const lastSet = sets[sets.length - 1];
    if (lastSet) {
      if (metricType === "weight_reps") {
        setWeight(lastSet.weight.toString());
        setReps(lastSet.reps.toString());
      } else if (metricType === "bodyweight_reps") {
        setReps(lastSet.reps.toString());
        if (lastSet.weight > 0) {
          setWeight(lastSet.weight.toString());
          setShowAddWeight(true);
        }
      } else if (metricType === "distance" || metricType === "time") {
        setValue(lastSet.value.toString());
      }
    }
  }, [activeSetIndex]);

  // Initialize inputs on first render
  useEffect(() => {
    const lastSet = sets[sets.length - 1];
    if (lastSet) {
      if (metricType === "weight_reps") {
        setWeight(lastSet.weight.toString());
        setReps(lastSet.reps.toString());
      } else if (metricType === "bodyweight_reps") {
        setReps(lastSet.reps.toString());
        if (lastSet.weight > 0) {
          setWeight(lastSet.weight.toString());
          setShowAddWeight(true);
        }
      } else if (metricType === "distance" || metricType === "time") {
        setValue(lastSet.value.toString());
      }
    }
  }, []);

  const ghost = getGhostForSet(activeSetIndex);
  const isViewingActiveSet = activePageIndex === activeSetIndex;

  const handleLogSet = useCallback(() => {
    let w = 0;
    let r = 0;
    let v = 0;

    if (metricType === "weight_reps") {
      w = parseFloat(weight) || 0;
      r = parseInt(reps, 10) || 0;
      if (r === 0) return;
    } else if (metricType === "bodyweight_reps") {
      w = showAddWeight ? (parseFloat(weight) || 0) : 0;
      r = parseInt(reps, 10) || 0;
      if (r === 0) return;
    } else if (metricType === "distance") {
      v = parseFloat(value) || 0;
      if (v === 0) return;
    } else if (metricType === "time") {
      v = parseFloat(value) || 0;
      if (v === 0) return;
    }

    logSet(numericExerciseId, w, r, v);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    counterScale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withTiming(1.0, { duration: 200 })
    );

    checkOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(400, withTiming(0, { duration: 200 }))
    );

    setRestTimerActive(true);
    setRestTimerStartedAt(Date.now());

    // Auto-advance to next exercise in superset
    if (nextSupersetExercise) {
      setTimeout(() => {
        router.replace({
          pathname: "/focused-entry",
          params: {
            exerciseId: String(nextSupersetExercise.id),
            exerciseName: nextSupersetExercise.name,
            metricType: nextSupersetExercise.metricType ?? "weight_reps",
            unit: nextSupersetExercise.unit ?? "lbs",
            supersetGroup,
            restTimerStartedAt: String(Date.now()),
          },
        });
      }, 600);
    }
  }, [weight, reps, value, metricType, showAddWeight, numericExerciseId, logSet, counterScale, checkOpacity, nextSupersetExercise, supersetGroup, router]);

  function handleFinish() {
    router.back();
  }

  // Render a logged set (read-only)
  function renderLoggedSet(setIndex: number) {
    const s = sets[setIndex];
    if (!s) return null;

    if (metricType === "weight_reps") {
      return (
        <View className="flex-1 justify-center gap-4">
          <View className="bg-green-50 rounded-xl p-6 items-center border border-green-200">
            <Text className="text-sm font-bold uppercase text-green-700 mb-2">
              Weight ({selectedUnit})
            </Text>
            <Text className="text-5xl font-bold text-green-800 text-center">
              {s.weight}
            </Text>
          </View>
          <View className="bg-green-50 rounded-xl p-6 items-center border border-green-200">
            <Text className="text-sm font-bold uppercase text-green-700 mb-2">
              Reps
            </Text>
            <Text className="text-5xl font-bold text-green-800 text-center">
              {s.reps}
            </Text>
          </View>
        </View>
      );
    }

    if (metricType === "bodyweight_reps") {
      return (
        <View className="flex-1 justify-center gap-4">
          {s.weight > 0 && (
            <View className="bg-green-50 rounded-xl p-6 items-center border border-green-200">
              <Text className="text-sm font-bold uppercase text-green-700 mb-2">
                Added Weight ({selectedUnit})
              </Text>
              <Text className="text-5xl font-bold text-green-800 text-center">
                {s.weight}
              </Text>
            </View>
          )}
          <View className="bg-green-50 rounded-xl p-6 items-center border border-green-200">
            <Text className="text-sm font-bold uppercase text-green-700 mb-2">
              Reps
            </Text>
            <Text className="text-5xl font-bold text-green-800 text-center">
              {s.reps}
            </Text>
          </View>
        </View>
      );
    }

    if (metricType === "distance") {
      return (
        <View className="flex-1 justify-center gap-4">
          <View className="bg-green-50 rounded-xl p-6 items-center border border-green-200">
            <Text className="text-sm font-bold uppercase text-green-700 mb-2">
              Distance (m)
            </Text>
            <Text className="text-5xl font-bold text-green-800 text-center">
              {s.value}
            </Text>
          </View>
        </View>
      );
    }

    // time
    return (
      <View className="flex-1 justify-center gap-4">
        <View className="bg-green-50 rounded-xl p-6 items-center border border-green-200">
          <Text className="text-sm font-bold uppercase text-green-700 mb-2">
            Time (seconds)
          </Text>
          <Text className="text-5xl font-bold text-green-800 text-center">
            {s.value}
          </Text>
        </View>
      </View>
    );
  }

  // Render the active set (editable)
  function renderActiveSet() {
    if (metricType === "weight_reps") {
      return (
        <View className="flex-1 justify-center gap-4">
          <View className="bg-white rounded-xl p-6 items-center">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-sm font-bold uppercase text-gray-500">
                Weight
              </Text>
              <TouchableOpacity
                onPress={toggleUnit}
                className="bg-gray-100 rounded-full px-3 py-1"
              >
                <Text className="text-sm font-bold text-primary">{selectedUnit}</Text>
              </TouchableOpacity>
            </View>
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
      );
    }

    if (metricType === "bodyweight_reps") {
      return (
        <View className="flex-1 justify-center gap-4">
          {showAddWeight ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm font-bold uppercase text-gray-500">
                  Added Weight
                </Text>
                <TouchableOpacity
                  onPress={toggleUnit}
                  className="bg-gray-100 rounded-full px-3 py-1"
                >
                  <Text className="text-sm font-bold text-primary">{selectedUnit}</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                className="text-5xl font-bold text-gray-900 text-center w-full"
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                placeholderTextColor="#D1D5DB"
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
          ) : (
            <TouchableOpacity
              className="items-center py-2"
              onPress={() => setShowAddWeight(true)}
            >
              <Text className="text-primary text-base font-semibold">
                + Add Weight
              </Text>
            </TouchableOpacity>
          )}
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
      );
    }

    if (metricType === "distance") {
      return (
        <View className="flex-1 justify-center gap-4">
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Distance (m)
            </Text>
            <TextInput
              className="text-5xl font-bold text-gray-900 text-center w-full"
              value={value}
              onChangeText={setValue}
              placeholder={ghost ? String(ghost.value) : "0"}
              placeholderTextColor="#D1D5DB"
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>
        </View>
      );
    }

    // time
    return (
      <View className="flex-1 justify-center gap-4">
        <View className="bg-white rounded-xl p-6 items-center">
          <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
            Time (seconds)
          </Text>
          <TextInput
            className="text-5xl font-bold text-gray-900 text-center w-full"
            value={value}
            onChangeText={setValue}
            placeholder={ghost ? String(ghost.value) : "0"}
            placeholderTextColor="#D1D5DB"
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
        </View>
      </View>
    );
  }

  const totalBoxes = activeSetIndex + 1;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Text className="text-lg font-semibold text-gray-500 mb-1">
            {exerciseName}
          </Text>
          {nextSupersetExercise && (
            <Text className="text-sm text-purple-600 mb-1">
              Next: {nextSupersetExercise.name}
            </Text>
          )}

          {/* Set counter with animation + rest timer */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Animated.Text
                className="text-4xl font-bold text-gray-900"
                style={counterStyle}
              >
                Set {activePageIndex + 1}
              </Animated.Text>
              <Animated.View style={[{ marginLeft: 8 }, checkStyle]}>
                <Check size={28} color="#22C55E" strokeWidth={3} />
              </Animated.View>
            </View>
            {restTimerActive && (
              <RestTimer
                durationSeconds={90}
                onDismiss={() => setRestTimerActive(false)}
                onComplete={() => setRestTimerActive(false)}
                startedAt={restTimerStartedAt}
              />
            )}
          </View>

          {/* Set indicator boxes */}
          <View className="flex-row gap-2 mb-6">
            {Array.from({ length: totalBoxes }).map((_, i) => {
              const isLogged = i < activeSetIndex;
              const isActive = i === activeSetIndex;
              const isViewing = i === activePageIndex;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActivePageIndex(i)}
                  className={`h-10 w-10 rounded-lg items-center justify-center ${
                    isLogged
                      ? "bg-green-500"
                      : isActive
                        ? "bg-primary"
                        : "bg-gray-200"
                  } ${isViewing ? "border-2 border-gray-900" : ""}`}
                  activeOpacity={0.7}
                >
                  {isLogged ? (
                    <Check size={16} color="#fff" strokeWidth={3} />
                  ) : (
                    <Text
                      className={`text-sm font-bold ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Set content: read-only for logged, editable for active */}
          {isViewingActiveSet ? renderActiveSet() : renderLoggedSet(activePageIndex)}

          <View className="gap-3 mb-4 mt-6">
            {isViewingActiveSet && (
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center"
                activeOpacity={0.8}
                onPress={handleLogSet}
              >
                <Text className="text-white text-lg font-semibold">Log Set</Text>
              </TouchableOpacity>
            )}

            {!isViewingActiveSet && (
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center"
                activeOpacity={0.8}
                onPress={() => setActivePageIndex(activeSetIndex)}
              >
                <Text className="text-white text-lg font-semibold">
                  Go to Set {activeSetIndex + 1}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="bg-white rounded-xl py-4 items-center border border-gray-200"
              activeOpacity={0.8}
              onPress={handleFinish}
            >
              <Text className="text-gray-700 text-lg font-semibold">
                Back to Workout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
