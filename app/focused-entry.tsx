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
import { useLiveActivity } from "@/src/hooks/useLiveActivity";

export default function FocusedEntryScreen() {
  const router = useRouter();
  const { exerciseId, exerciseName } = useLocalSearchParams<{
    exerciseId: string;
    exerciseName: string;
  }>();

  const { logSet, exercises } = useWorkout();
  const numericExerciseId = Number(exerciseId);

  const exercise = exercises.find((ex) => ex.id === numericExerciseId);
  const sets = exercise?.sets ?? [];
  const activeSetIndex = sets.length; // next set to log

  const { getGhostForSet } = useExerciseHistory(exerciseName ?? "");
  const { start: startLiveActivity, update: updateLiveActivity, end: endLiveActivity } = useLiveActivity();

  const [activePageIndex, setActivePageIndex] = useState(activeSetIndex);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

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
    // Pre-fill inputs from last logged set for the next set
    const lastSet = sets[sets.length - 1];
    if (lastSet) {
      setWeight(lastSet.weight.toString());
      setReps(lastSet.reps.toString());
    }
  }, [activeSetIndex]);

  // Initialize inputs on first render
  useEffect(() => {
    const lastSet = sets[sets.length - 1];
    if (lastSet) {
      setWeight(lastSet.weight.toString());
      setReps(lastSet.reps.toString());
    }
  }, []);

  // Start Live Activity on mount
  useEffect(() => {
    const initialGhost = getGhostForSet(0);
    startLiveActivity({
      exerciseName: exerciseName ?? "",
      exerciseId: numericExerciseId,
      ghostWeight: initialGhost?.weight,
      ghostReps: initialGhost?.reps,
    });
  }, [numericExerciseId]);

  const ghost = getGhostForSet(activeSetIndex);

  const isViewingActiveSet = activePageIndex === activeSetIndex;

  const handleLogSet = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (r === 0) return;

    logSet(numericExerciseId, w, r);

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Scale pulse on counter
    counterScale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withTiming(1.0, { duration: 200 })
    );

    // Brief checkmark flash
    checkOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(400, withTiming(0, { duration: 200 }))
    );

    // Update Live Activity
    const nextSetIndex = activeSetIndex + 1;
    const nextGhost = getGhostForSet(nextSetIndex);
    updateLiveActivity({
      currentSetNumber: nextSetIndex + 1,
      lastSetWeight: w,
      lastSetReps: r,
      ghostWeight: nextGhost?.weight,
      ghostReps: nextGhost?.reps,
    });
  }, [weight, reps, numericExerciseId, logSet, counterScale, checkOpacity, activeSetIndex, getGhostForSet, updateLiveActivity]);

  function handleFinish() {
    endLiveActivity();
    router.back();
  }

  // Render a logged set (read-only)
  function renderLoggedSet(setIndex: number) {
    const s = sets[setIndex];
    if (!s) return null;
    return (
      <View className="flex-1 justify-center gap-4">
        <View className="bg-green-50 rounded-xl p-6 items-center border border-green-200">
          <Text className="text-sm font-bold uppercase text-green-700 mb-2">
            Weight (lbs)
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

  // Render the active set (editable)
  function renderActiveSet() {
    return (
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
    );
  }

  // Total indicator boxes: logged sets + 1 active
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

          {/* Set counter with animation */}
          <View className="flex-row items-center mb-4">
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
                Finish Exercise
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
