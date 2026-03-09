import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { X, Plus } from "lucide-react-native";
import { EXERCISES, ExerciseDefinition, getAllExercises } from "@/src/data/exercises";
import { getAllCustomExercises } from "@/src/db/queries";
import { CreateExerciseModal } from "./CreateExerciseModal";

interface ExerciseSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseDefinition) => void;
}

export function ExerciseSearch({
  visible,
  onClose,
  onSelect,
}: ExerciseSearchProps) {
  const [query, setQuery] = useState("");
  const [allExercises, setAllExercises] = useState<ExerciseDefinition[]>(EXERCISES);
  const [createVisible, setCreateVisible] = useState(false);

  function loadExercises() {
    const customs = getAllCustomExercises();
    setAllExercises(getAllExercises(customs));
  }

  useEffect(() => {
    if (visible) {
      loadExercises();
    }
  }, [visible]);

  const filtered = allExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(query.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(exercise: ExerciseDefinition) {
    onSelect(exercise);
    setQuery("");
    onClose();
  }

  function handleCreated() {
    loadExercises();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background pt-4">
        <View className="flex-row items-center justify-between px-5 mb-4">
          <Text className="text-2xl font-bold text-gray-900">
            Add Exercise
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View className="px-5 mb-4">
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-base text-gray-900"
            placeholder="Search exercises..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ListHeaderComponent={
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-3 flex-row items-center border border-dashed border-gray-300"
              activeOpacity={0.7}
              onPress={() => setCreateVisible(true)}
            >
              <Plus size={20} color="#007AFF" />
              <Text className="text-base font-bold text-primary ml-2">
                Create Custom Exercise
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-3"
              activeOpacity={0.7}
              onPress={() => handleSelect(item)}
            >
              <Text className="text-base font-bold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {item.muscleGroup}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center py-8">
              No exercises found
            </Text>
          }
        />
      </View>

      <CreateExerciseModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={handleCreated}
      />
    </Modal>
  );
}
