import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { Card } from "@/src/components/Card";

export default function ActiveWorkoutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          The Flow
        </Text>

        <Card className="mb-6 items-center">
          <Text className="text-sm font-bold uppercase text-gray-500 mb-1">
            Duration
          </Text>
          <Text className="text-4xl font-bold text-gray-900">00:00:00</Text>
        </Card>

        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 mb-4">
            No exercises yet. Add one to begin.
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 flex-row items-center justify-center mb-4"
          activeOpacity={0.8}
        >
          <Plus size={20} color="#fff" />
          <Text className="text-white text-lg font-semibold ml-2">
            Add Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
