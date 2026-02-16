import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";

interface WorkoutSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, notes: string, saveAsRoutine: boolean) => void;
  duration: number;
  setCount: number;
  totalVolume: number;
  exerciseNames: string[];
  defaultName: string;
}

export function WorkoutSummaryModal({
  visible,
  onClose,
  onSave,
  duration,
  setCount,
  totalVolume,
  exerciseNames,
  defaultName,
}: WorkoutSummaryModalProps) {
  const [name, setName] = useState(defaultName);
  const [notes, setNotes] = useState("");
  const [saveAsRoutine, setSaveAsRoutine] = useState(false);

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  function handleSave() {
    onSave(name.trim() || defaultName, notes.trim(), saveAsRoutine);
    setName(defaultName);
    setNotes("");
    setSaveAsRoutine(false);
  }

  function handleClose() {
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
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
                Workout Complete
              </Text>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-white rounded-xl p-4 items-center">
                <Text className="text-sm font-bold uppercase text-gray-500 mb-1">
                  Duration
                </Text>
                <Text className="text-xl font-bold text-gray-900">
                  {durationStr}
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 items-center">
                <Text className="text-sm font-bold uppercase text-gray-500 mb-1">
                  Sets
                </Text>
                <Text className="text-xl font-bold text-gray-900">
                  {setCount}
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 items-center">
                <Text className="text-sm font-bold uppercase text-gray-500 mb-1">
                  Volume
                </Text>
                <Text className="text-xl font-bold text-gray-900">
                  {Math.round(totalVolume).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Exercises performed */}
            {exerciseNames.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-6">
                <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
                  Exercises
                </Text>
                {exerciseNames.map((exName, i) => (
                  <Text key={i} className="text-base text-gray-900">
                    {exName}
                  </Text>
                ))}
              </View>
            )}

            {/* Name input */}
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Workout Name
            </Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
              value={name}
              onChangeText={setName}
              placeholder="Workout"
              placeholderTextColor="#9CA3AF"
            />

            {/* Notes input */}
            <Text className="text-sm font-bold uppercase text-gray-500 mb-2">
              Notes
            </Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 text-base text-gray-900 mb-6"
              value={notes}
              onChangeText={setNotes}
              placeholder="How did it go?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
            />

            {/* Save as routine toggle */}
            <View className="flex-row items-center justify-between bg-white rounded-xl px-4 py-3 mb-6">
              <Text className="text-base font-semibold text-gray-900">
                Save as Routine
              </Text>
              <Switch
                value={saveAsRoutine}
                onValueChange={setSaveAsRoutine}
                trackColor={{ false: "#D1D5DB", true: "#007AFF" }}
                thumbColor="#fff"
              />
            </View>

            {/* Save button */}
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mb-4"
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <Text className="text-white text-lg font-semibold">
                Save & Finish
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
