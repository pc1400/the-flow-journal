import React, { createContext, useContext, useState, useCallback } from "react";
import * as queries from "@/src/db/queries";

export interface WorkoutSet {
  id: number;
  weight: number;
  reps: number;
  value: number;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  muscleGroup: string;
  metricType: string;
  unit: string;
  supersetGroup: number | null;
  sets: WorkoutSet[];
}

interface WorkoutState {
  workoutId: number | null;
  exercises: WorkoutExercise[];
  isActive: boolean;
  startTime: number | null;
}

interface WorkoutContextValue extends WorkoutState {
  startWorkout: (name?: string) => void;
  addExercise: (name: string, muscleGroup: string, metricType?: string, unit?: string) => void;
  logSet: (exerciseId: number, weight: number, reps: number, value?: number) => void;
  finishWorkout: (name?: string, notes?: string, duration?: number) => void;
  refreshExerciseSets: (exerciseId: number) => void;
  startWorkoutFromTemplate: (templateId: number) => void;
  createSupersetFromExercises: (exerciseIds: number[]) => void;
  removeSupersetGroup: (exerciseId: number) => void;
  updateExerciseUnit: (exerciseId: number, unit: string) => void;
  reorderExercises: (orderedIds: number[]) => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkoutState>({
    workoutId: null,
    exercises: [],
    isActive: false,
    startTime: null,
  });

  const startWorkout = useCallback((name?: string) => {
    const id = queries.createWorkout(name ?? "Workout");
    setState({
      workoutId: id,
      exercises: [],
      isActive: true,
      startTime: Date.now(),
    });
  }, []);

  const addExercise = useCallback(
    (name: string, muscleGroup: string, metricType: string = "weight_reps", unit: string = "lbs") => {
      if (!state.workoutId) return;
      const orderIndex = state.exercises.length;
      const id = queries.addExercise(
        state.workoutId,
        name,
        muscleGroup,
        orderIndex,
        metricType,
        unit
      );
      setState((prev) => ({
        ...prev,
        exercises: [
          ...prev.exercises,
          { id, name, muscleGroup, metricType, unit, supersetGroup: null, sets: [] },
        ],
      }));
    },
    [state.workoutId, state.exercises.length]
  );

  const logSet = useCallback(
    (exerciseId: number, weight: number, reps: number, value: number = 0) => {
      const setId = queries.logSet(exerciseId, weight, reps, value);
      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId
            ? { ...ex, sets: [...ex.sets, { id: setId, weight, reps, value }] }
            : ex
        ),
      }));
    },
    []
  );

  const refreshExerciseSets = useCallback((exerciseId: number) => {
    const rows = queries.getSetsForExercise(exerciseId);
    const sets: WorkoutSet[] = rows.map((r) => ({
      id: r.id,
      weight: r.weight,
      reps: r.reps,
      value: r.value,
    }));
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets } : ex
      ),
    }));
  }, []);

  const finishWorkout = useCallback(
    (name?: string, notes?: string, explicitDuration?: number) => {
      if (!state.workoutId || !state.startTime) return;
      const duration =
        explicitDuration ?? Math.floor((Date.now() - state.startTime) / 1000);
      queries.finishWorkout(state.workoutId, duration, name, notes);
      setState({
        workoutId: null,
        exercises: [],
        isActive: false,
        startTime: null,
      });
    },
    [state.workoutId, state.startTime]
  );

  const startWorkoutFromTemplate = useCallback((templateId: number) => {
    const templateExercises = queries.getTemplateExercises(templateId);
    const id = queries.createWorkout("Workout");
    const newExercises: WorkoutExercise[] = [];
    for (const te of templateExercises) {
      const exId = queries.addExercise(
        id,
        te.exercise_name,
        te.muscle_group ?? "",
        te.order_index,
        te.metric_type ?? "weight_reps"
      );
      newExercises.push({
        id: exId,
        name: te.exercise_name,
        muscleGroup: te.muscle_group ?? "",
        metricType: te.metric_type ?? "weight_reps",
        unit: "lbs",
        supersetGroup: te.superset_group ?? null,
        sets: [],
      });
    }
    setState({
      workoutId: id,
      exercises: newExercises,
      isActive: true,
      startTime: Date.now(),
    });
  }, []);

  const createSupersetFromExercises = useCallback(
    (exerciseIds: number[]) => {
      if (!state.workoutId || exerciseIds.length < 2) return;
      const group = queries.getNextSupersetGroup(state.workoutId);
      for (const eid of exerciseIds) {
        queries.updateSupersetGroup(eid, group);
      }
      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          exerciseIds.includes(ex.id)
            ? { ...ex, supersetGroup: group }
            : ex
        ),
      }));
    },
    [state.workoutId]
  );

  const updateExerciseUnit = useCallback(
    (exerciseId: number, unit: string) => {
      queries.updateExerciseUnit(exerciseId, unit);
      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, unit } : ex
        ),
      }));
    },
    []
  );

  const reorderExercises = useCallback((orderedIds: number[]) => {
    const updates = orderedIds.map((id, i) => ({ id, orderIndex: i }));
    queries.batchUpdateExerciseOrder(updates);
    setState((prev) => {
      const byId = new Map(prev.exercises.map((ex) => [ex.id, ex]));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((ex): ex is WorkoutExercise => ex != null);
      return { ...prev, exercises: reordered };
    });
  }, []);

  const removeSupersetGroup = useCallback((exerciseId: number) => {
    queries.updateSupersetGroup(exerciseId, null);
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, supersetGroup: null } : ex
      ),
    }));
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        ...state,
        startWorkout,
        addExercise,
        logSet,
        finishWorkout,
        refreshExerciseSets,
        startWorkoutFromTemplate,
        createSupersetFromExercises,
        removeSupersetGroup,
        updateExerciseUnit,
        reorderExercises,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return ctx;
}
