import { TouchableOpacity, Text, View } from "react-native";
import { ChevronRight, CheckCircle2 } from "lucide-react-native";
import { Card } from "./Card";

interface ExerciseCardProps {
  name: string;
  muscleGroup: string;
  setCount: number;
  onPress: () => void;
}

export function ExerciseCard({
  name,
  muscleGroup,
  setCount,
  onPress,
}: ExerciseCardProps) {
  const hasLoggedSets = setCount > 0;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card
        className={`mb-3 ${hasLoggedSets ? "border-l-4 border-l-green-500" : ""}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">{name}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {muscleGroup} &middot; {setCount} {setCount === 1 ? "set" : "sets"} done
            </Text>
          </View>
          {hasLoggedSets ? (
            <CheckCircle2 size={20} color="#22C55E" />
          ) : (
            <ChevronRight size={20} color="#9CA3AF" />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
