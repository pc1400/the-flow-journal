import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X } from "lucide-react-native";
import { MetricType, EXERCISES } from "@/src/data/exercises";
import { createCustomExercise, getAllCustomExercises } from "@/src/db/queries";

interface CreateExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Other"];
const METRIC_OPTIONS: { label: string; value: MetricType }[] = [
  { label: "Weight + Reps", value: "weight_reps" },
  { label: "Bodyweight + Reps", value: "bodyweight_reps" },
  { label: "Distance", value: "distance" },
  { label: "Time", value: "time" },
];

export function CreateExerciseModal({
  visible,
  onClose,
  onCreated,
}: CreateExerciseModalProps) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Chest");
  const [metricType, setMetricType] = useState<MetricType>("weight_reps");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter an exercise name.");
      return;
    }

    // Check uniqueness against builtins
    const builtinMatch = EXERCISES.find(
      (e) => e.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (builtinMatch) {
      Alert.alert("Error", `"${trimmed}" already exists as a built-in exercise.`);
      return;
    }

    // Check uniqueness against custom exercises
    const customs = getAllCustomExercises();
    const customMatch = customs.find(
      (e) => e.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (customMatch) {
      Alert.alert("Error", `"${trimmed}" already exists as a custom exercise.`);
      return;
    }

    const isBodyweight = metricType === "bodyweight_reps";
    createCustomExercise(trimmed, muscleGroup, metricType, isBodyweight);

    setName("");
    setMuscleGroup("Chest");
    setMetricType("weight_reps");
    onCreated();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View className="flex-1 pt-4 px-5">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Create Exercise
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Exercise Name
            </Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rowing Machine"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            {/* Muscle Group */}
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Muscle Group
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {MUSCLE_GROUPS.map((mg) => (
                <TouchableOpacity
                  key={mg}
                  className={`px-4 py-2 rounded-full ${
                    muscleGroup === mg ? "bg-primary" : "bg-white"
                  }`}
                  onPress={() => setMuscleGroup(mg)}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      muscleGroup === mg ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {mg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Metric Type */}
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Metric Type
            </Text>
            <View className="gap-2 mb-6">
              {METRIC_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`px-4 py-3 rounded-xl ${
                    metricType === opt.value ? "bg-primary" : "bg-white"
                  }`}
                  onPress={() => setMetricType(opt.value)}
                >
                  <Text
                    className={`text-base font-semibold ${
                      metricType === opt.value ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save button */}
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mb-4"
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <Text className="text-white text-lg font-semibold">
                Save Exercise
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
