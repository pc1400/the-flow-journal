import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { TemplateExerciseRow } from "@/src/db/queries";

interface RoutinePreviewModalProps {
  visible: boolean;
  routineName: string;
  exercises: TemplateExerciseRow[];
  onStart: () => void;
  onClose: () => void;
}

export function RoutinePreviewModal({
  visible,
  routineName,
  exercises,
  onStart,
  onClose,
}: RoutinePreviewModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-background pt-4 px-5">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>
            {routineName}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-bold uppercase text-gray-500 mb-3">
          Exercises
        </Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {exercises.map((ex, i) => (
            <View
              key={ex.id}
              className="bg-white rounded-xl p-4 mb-3"
            >
              <Text className="text-base font-bold text-gray-900">
                {i + 1}. {ex.exercise_name}
              </Text>
              {ex.muscle_group ? (
                <Text className="text-sm text-gray-500 mt-1">
                  {ex.muscle_group}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mb-4 mt-4"
          activeOpacity={0.8}
          onPress={onStart}
        >
          <Text className="text-white text-lg font-semibold">
            Jump into Routine
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
