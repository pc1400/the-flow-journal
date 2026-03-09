import React, { useRef, useCallback, useMemo } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { GestureDetector, Gesture, ScrollView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { WorkoutExercise } from "@/src/context/WorkoutContext";
import { ExerciseCard } from "./ExerciseCard";
import { SupersetCard } from "./SupersetCard";

type GroupedItem =
  | { type: "single"; exercise: WorkoutExercise }
  | { type: "superset"; group: number; exercises: WorkoutExercise[] };

interface DraggableExerciseListProps {
  groupedItems: GroupedItem[];
  onExercisePress: (exerciseId: number, exerciseName: string) => void;
  onUngroup: (exerciseIds: number[]) => void;
  onReorder: (orderedIds: number[]) => void;
  onCreateSuperset: (exerciseIds: number[]) => void;
}

interface LayoutInfo {
  y: number;
  height: number;
}

export function DraggableExerciseList({
  groupedItems,
  onExercisePress,
  onUngroup,
  onReorder,
  onCreateSuperset,
}: DraggableExerciseListProps) {
  const layouts = useRef<Map<number, LayoutInfo>>(new Map());
  const dragIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dropTarget = useSharedValue(-1); // index for merge target
  const insertionIndex = useSharedValue(-1); // index for reorder insertion

  // Get all exercise IDs in order (flattened from groups)
  const allExerciseIds = useMemo(() => {
    const ids: number[] = [];
    for (const item of groupedItems) {
      if (item.type === "single") {
        ids.push(item.exercise.id);
      } else {
        for (const ex of item.exercises) {
          ids.push(ex.id);
        }
      }
    }
    return ids;
  }, [groupedItems]);

  const handleLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      layouts.current.set(index, { y, height });
    },
    []
  );

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleDrop = useCallback(
    (fromIdx: number, targetIdx: number, insertIdx: number) => {
      if (targetIdx >= 0 && targetIdx !== fromIdx) {
        // Merge into superset
        const draggedItem = groupedItems[fromIdx];
        const targetItem = groupedItems[targetIdx];
        const draggedIds =
          draggedItem.type === "single"
            ? [draggedItem.exercise.id]
            : draggedItem.exercises.map((e) => e.id);
        const targetIds =
          targetItem.type === "single"
            ? [targetItem.exercise.id]
            : targetItem.exercises.map((e) => e.id);
        onCreateSuperset([...targetIds, ...draggedIds]);
      } else if (insertIdx >= 0 && insertIdx !== fromIdx) {
        // Reorder
        const newItems = [...groupedItems];
        const [moved] = newItems.splice(fromIdx, 1);
        const adjustedIdx = insertIdx > fromIdx ? insertIdx - 1 : insertIdx;
        newItems.splice(adjustedIdx, 0, moved);
        const newOrderedIds: number[] = [];
        for (const item of newItems) {
          if (item.type === "single") {
            newOrderedIds.push(item.exercise.id);
          } else {
            for (const ex of item.exercises) {
              newOrderedIds.push(ex.id);
            }
          }
        }
        onReorder(newOrderedIds);
      }
    },
    [groupedItems, onReorder, onCreateSuperset]
  );

  const createGesture = useCallback(
    (index: number) => {
      return Gesture.Pan()
        .activateAfterLongPress(300)
        .runOnJS(true)
        .onStart(() => {
          dragIndex.value = index;
          isDragging.value = true;
          dragY.value = 0;
          dragStartY.value = 0;
          dropTarget.value = -1;
          insertionIndex.value = -1;
          triggerHaptic();
        })
        .onUpdate((e) => {
          dragY.value = e.translationY;

          // Hit-test against other items
          const currentLayout = layouts.current.get(index);
          if (!currentLayout) return;

          const draggedCenter =
            currentLayout.y + currentLayout.height / 2 + e.translationY;

          let foundMerge = -1;
          let foundInsert = -1;
          let closestInsertDist = Infinity;

          for (let i = 0; i < groupedItems.length; i++) {
            if (i === index) continue;
            const layout = layouts.current.get(i);
            if (!layout) continue;

            const itemCenter = layout.y + layout.height / 2;
            const mergeZone = layout.height * 0.3;

            // Check merge: within center zone
            if (Math.abs(draggedCenter - itemCenter) < mergeZone) {
              foundMerge = i;
              break;
            }

            // Check insertion: between items
            const topEdge = layout.y;
            const bottomEdge = layout.y + layout.height;

            if (draggedCenter < topEdge) {
              const dist = topEdge - draggedCenter;
              if (dist < closestInsertDist) {
                closestInsertDist = dist;
                foundInsert = i;
              }
            } else if (draggedCenter > bottomEdge) {
              const dist = draggedCenter - bottomEdge;
              if (dist < closestInsertDist) {
                closestInsertDist = dist;
                foundInsert = i + 1;
              }
            }
          }

          if (foundMerge >= 0) {
            dropTarget.value = foundMerge;
            insertionIndex.value = -1;
          } else {
            dropTarget.value = -1;
            insertionIndex.value = foundInsert;
          }
        })
        .onEnd(() => {
          const fromIdx = dragIndex.value;
          const targetIdx = dropTarget.value;
          const insertIdx = insertionIndex.value;

          isDragging.value = false;
          dragIndex.value = -1;
          dragY.value = 0;
          dropTarget.value = -1;
          insertionIndex.value = -1;

          handleDrop(fromIdx, targetIdx, insertIdx);
        })
        .onFinalize(() => {
          isDragging.value = false;
          dragIndex.value = -1;
          dragY.value = 0;
          dropTarget.value = -1;
          insertionIndex.value = -1;
        });
    },
    [
      groupedItems,
      dragIndex,
      dragY,
      dragStartY,
      isDragging,
      dropTarget,
      insertionIndex,
      triggerHaptic,
      handleDrop,
    ]
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 16 }}
    >
      {groupedItems.length === 0 && (
        <View className="items-center py-8">
          <Text className="text-gray-400">
            No exercises yet. Add one to begin.
          </Text>
        </View>
      )}

      {groupedItems.map((item, index) => (
        <DraggableItem
          key={item.type === "single" ? item.exercise.id : `ss-${item.group}`}
          item={item}
          index={index}
          dragIndex={dragIndex}
          dragY={dragY}
          isDragging={isDragging}
          dropTarget={dropTarget}
          insertionIndex={insertionIndex}
          onLayout={handleLayout(index)}
          gesture={createGesture(index)}
          onExercisePress={onExercisePress}
          onUngroup={onUngroup}
        />
      ))}
    </ScrollView>
  );
}

interface DraggableItemProps {
  item: GroupedItem;
  index: number;
  dragIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  isDragging: SharedValue<boolean>;
  dropTarget: SharedValue<number>;
  insertionIndex: SharedValue<number>;
  onLayout: (e: LayoutChangeEvent) => void;
  gesture: ReturnType<typeof Gesture.Pan>;
  onExercisePress: (exerciseId: number, exerciseName: string) => void;
  onUngroup: (exerciseIds: number[]) => void;
}

function DraggableItem({
  item,
  index,
  dragIndex,
  dragY,
  isDragging,
  dropTarget,
  insertionIndex,
  onLayout,
  gesture,
  onExercisePress,
  onUngroup,
}: DraggableItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const isBeingDragged = dragIndex.value === index && isDragging.value;
    const isMergeTarget = dropTarget.value === index;
    const isInsertTarget = insertionIndex.value === index;

    return {
      transform: [
        { translateY: isBeingDragged ? dragY.value : 0 },
        { scale: isBeingDragged ? withSpring(1.03) : withSpring(1) },
      ],
      zIndex: isBeingDragged ? 100 : 0,
      opacity: isBeingDragged ? 0.9 : 1,
      borderWidth: isMergeTarget ? 2 : 0,
      borderColor: isMergeTarget ? "#7C3AED" : "transparent",
      borderRadius: isMergeTarget ? 12 : 0,
      borderTopWidth: isInsertTarget && !isMergeTarget ? 3 : isMergeTarget ? 2 : 0,
      borderTopColor: isInsertTarget && !isMergeTarget ? "#007AFF" : isMergeTarget ? "#7C3AED" : "transparent",
    };
  });

  const hintStyle = useAnimatedStyle(() => {
    const isMergeTarget = dropTarget.value === index;
    return {
      opacity: isMergeTarget ? 1 : 0,
      height: isMergeTarget ? 20 : 0,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View onLayout={onLayout} style={animatedStyle}>
        {item.type === "superset" ? (
          <SupersetCard
            exercises={item.exercises}
            onExercisePress={onExercisePress}
            onUngroup={onUngroup}
          />
        ) : (
          <ExerciseCard
            name={item.exercise.name}
            muscleGroup={item.exercise.muscleGroup}
            setCount={item.exercise.sets.length}
            onPress={() =>
              onExercisePress(item.exercise.id, item.exercise.name)
            }
          />
        )}
        <Animated.View
          style={hintStyle}
          className="items-center justify-center"
        >
          <Text className="text-xs font-bold text-purple-600">
            Drop to superset
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
