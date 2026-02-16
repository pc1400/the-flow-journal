import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/src/components/Card";

export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">
          The Flow Journal
        </Text>

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mb-6"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">
            Start Empty Workout
          </Text>
        </TouchableOpacity>

        <Text className="text-lg font-bold uppercase text-gray-500 mb-3">
          Recent Workouts
        </Text>

        <Card>
          <Text className="text-gray-400 text-center py-8">
            No workouts yet. Start your first flow!
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}
