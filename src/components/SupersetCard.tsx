import { View, Text, TouchableOpacity, Alert } from "react-native";
import { WorkoutExercise } from "@/src/context/WorkoutContext";
import { ExerciseCard } from "./ExerciseCard";

interface SupersetCardProps {
  exercises: WorkoutExercise[];
  onExercisePress: (exerciseId: number, exerciseName: string) => void;
  onUngroup: (exerciseIds: number[]) => void;
}

export function SupersetCard({
  exercises,
  onExercisePress,
  onUngroup,
}: SupersetCardProps) {
  function handleLongPress() {
    Alert.alert("Superset", "Ungroup these exercises?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Ungroup",
        style: "destructive",
        onPress: () => onUngroup(exercises.map((e) => e.id)),
      },
    ]);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={handleLongPress}
      className="mb-3"
    >
      <View className="border-l-4 border-l-purple-500 bg-purple-50 rounded-xl pl-3 pr-1 py-2">
        <Text className="text-xs font-bold uppercase text-purple-600 mb-1 ml-1">
          Superset
        </Text>
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            name={ex.name}
            muscleGroup={ex.muscleGroup}
            setCount={ex.sets.length}
            onPress={() => onExercisePress(ex.id, ex.name)}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
}
