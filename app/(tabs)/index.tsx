import { View, Text, TouchableOpacity, FlatList, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import {
  getRecentWorkouts,
  getAllTemplates,
  getTemplateExercises,
  deleteWorkout,
  deleteTemplate,
  updateTemplateName,
  WorkoutRow,
  TemplateRow,
  TemplateExerciseRow,
} from "@/src/db/queries";
import { Card } from "@/src/components/Card";
import { NameInputModal } from "@/src/components/NameInputModal";
import { RoutinePreviewModal } from "@/src/components/RoutinePreviewModal";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { Trash2 } from "lucide-react-native";

export default function HistoryScreen() {
  const router = useRouter();
  const { startWorkout, startWorkoutFromTemplate, isActive } = useWorkout();
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);

  // Rename modal state
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameTemplateId, setRenameTemplateId] = useState<number | null>(null);
  const [renameDefaultValue, setRenameDefaultValue] = useState("");

  // Routine preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRow | null>(null);
  const [previewExercises, setPreviewExercises] = useState<TemplateExerciseRow[]>([]);

  const refreshData = useCallback(() => {
    setWorkouts(getRecentWorkouts());
    try {
      setTemplates(getAllTemplates());
    } catch {
      // templates table may not exist yet on first render
    }
  }, []);

  useFocusEffect(refreshData);

  function handleStartWorkout() {
    startWorkout("Workout");
    router.navigate("/(tabs)/active-workout");
  }

  function handleRoutineTap(template: TemplateRow) {
    const exercises = getTemplateExercises(template.id);
    setPreviewTemplate(template);
    setPreviewExercises(exercises);
    setPreviewVisible(true);
  }

  function handlePreviewStart() {
    if (previewTemplate) {
      startWorkoutFromTemplate(previewTemplate.id);
      setPreviewVisible(false);
      setPreviewTemplate(null);
      router.navigate("/(tabs)/active-workout");
    }
  }

  function handleRoutineLongPress(template: TemplateRow) {
    Alert.alert(template.name, undefined, [
      {
        text: "Rename",
        onPress: () => {
          setRenameTemplateId(template.id);
          setRenameDefaultValue(template.name);
          setRenameVisible(true);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Routine",
            `Are you sure you want to delete "${template.name}"?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                  deleteTemplate(template.id);
                  refreshData();
                },
              },
            ]
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function handleRenameConfirm(newName: string) {
    if (renameTemplateId !== null) {
      updateTemplateName(renameTemplateId, newName);
      refreshData();
    }
    setRenameVisible(false);
    setRenameTemplateId(null);
  }

  function handleDeleteWorkout(workoutId: number) {
    deleteWorkout(workoutId);
    refreshData();
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function renderDeleteAction() {
    return (
      <TouchableOpacity
        className="bg-red-500 rounded-xl mb-3 items-center justify-center px-6"
        activeOpacity={0.8}
      >
        <Trash2 size={20} color="#fff" />
        <Text className="text-white text-xs font-semibold mt-1">Delete</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">
          The Flow Journal
        </Text>

        {!isActive && (
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mb-6"
            activeOpacity={0.8}
            onPress={handleStartWorkout}
          >
            <Text className="text-white text-lg font-semibold">
              Start Empty Workout
            </Text>
          </TouchableOpacity>
        )}

        {isActive && (
          <TouchableOpacity
            className="bg-white rounded-xl py-4 items-center mb-6 border-2 border-primary"
            activeOpacity={0.8}
            onPress={() => router.navigate("/(tabs)/active-workout")}
          >
            <Text className="text-primary text-lg font-semibold">
              Continue Workout
            </Text>
          </TouchableOpacity>
        )}

        {!isActive && templates.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold uppercase text-gray-500 mb-3">
              My Routines
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  activeOpacity={0.7}
                  onPress={() => handleRoutineTap(template)}
                  onLongPress={() => handleRoutineLongPress(template)}
                >
                  <Card className="w-40">
                    <Text
                      className="text-base font-bold text-gray-900"
                      numberOfLines={1}
                    >
                      {template.name}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text className="text-lg font-bold uppercase text-gray-500 mb-3">
          Recent Workouts
        </Text>

        <FlatList
          data={workouts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={renderDeleteAction}
              onSwipeableOpen={() => handleDeleteWorkout(item.id)}
              overshootRight={false}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/workout-detail",
                    params: { workoutId: String(item.id) },
                  })
                }
              >
                <Card className="mb-3">
                  <Text className="text-base font-bold text-gray-900">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {formatDate(item.date)} &middot; {formatDuration(item.duration)}
                    {item.total_volume > 0 ? ` \u00B7 ${Math.round(item.total_volume).toLocaleString()} lbs` : ""}
                  </Text>
                </Card>
              </TouchableOpacity>
            </Swipeable>
          )}
          ListEmptyComponent={
            <Card>
              <Text className="text-gray-400 text-center py-8">
                No workouts yet. Start your first flow!
              </Text>
            </Card>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          className="flex-1"
        />
      </View>

      <NameInputModal
        visible={renameVisible}
        title="Rename Routine"
        defaultValue={renameDefaultValue}
        confirmLabel="Save"
        onConfirm={handleRenameConfirm}
        onCancel={() => {
          setRenameVisible(false);
          setRenameTemplateId(null);
        }}
      />

      <RoutinePreviewModal
        visible={previewVisible}
        routineName={previewTemplate?.name ?? ""}
        exercises={previewExercises}
        onStart={handlePreviewStart}
        onClose={() => {
          setPreviewVisible(false);
          setPreviewTemplate(null);
        }}
      />
    </SafeAreaView>
  );
}
