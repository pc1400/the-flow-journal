import React, { createContext, useContext, useState, useCallback } from "react";
import * as queries from "@/src/db/queries";

export interface WorkoutSet {
  id: number;
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  muscleGroup: string;
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
  addExercise: (name: string, muscleGroup: string) => void;
  logSet: (exerciseId: number, weight: number, reps: number) => void;
  finishWorkout: () => void;
  refreshExerciseSets: (exerciseId: number) => void;
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
    (name: string, muscleGroup: string) => {
      if (!state.workoutId) return;
      const orderIndex = state.exercises.length;
      const id = queries.addExercise(
        state.workoutId,
        name,
        muscleGroup,
        orderIndex
      );
      setState((prev) => ({
        ...prev,
        exercises: [
          ...prev.exercises,
          { id, name, muscleGroup, sets: [] },
        ],
      }));
    },
    [state.workoutId, state.exercises.length]
  );

  const logSet = useCallback(
    (exerciseId: number, weight: number, reps: number) => {
      const setId = queries.logSet(exerciseId, weight, reps);
      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId
            ? { ...ex, sets: [...ex.sets, { id: setId, weight, reps }] }
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
    }));
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets } : ex
      ),
    }));
  }, []);

  const finishWorkout = useCallback(() => {
    if (!state.workoutId || !state.startTime) return;
    const duration = Math.floor((Date.now() - state.startTime) / 1000);
    queries.finishWorkout(state.workoutId, duration);
    setState({
      workoutId: null,
      exercises: [],
      isActive: false,
      startTime: null,
    });
  }, [state.workoutId, state.startTime]);

  return (
    <WorkoutContext.Provider
      value={{
        ...state,
        startWorkout,
        addExercise,
        logSet,
        finishWorkout,
        refreshExerciseSets,
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
