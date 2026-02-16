import { getDatabase } from "./db";

export interface SetRow {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  is_completed: number;
  timestamp: string | null;
}

export interface ExerciseRow {
  id: number;
  workout_id: number;
  name: string;
  muscle_group: string | null;
  order_index: number;
}

export interface WorkoutRow {
  id: number;
  date: string;
  name: string;
  total_volume: number;
  duration: number;
}

export function createWorkout(name: string): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO workouts (date, name) VALUES (?, ?)",
    new Date().toISOString(),
    name
  );
  return result.lastInsertRowId;
}

export function addExercise(
  workoutId: number,
  name: string,
  muscleGroup: string,
  orderIndex: number
): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO exercises (workout_id, name, muscle_group, order_index) VALUES (?, ?, ?, ?)",
    workoutId,
    name,
    muscleGroup,
    orderIndex
  );
  return result.lastInsertRowId;
}

export function logSet(
  exerciseId: number,
  weight: number,
  reps: number
): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO sets (exercise_id, weight, reps, is_completed, timestamp) VALUES (?, ?, ?, 1, ?)",
    exerciseId,
    weight,
    reps,
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export function getSetsForExercise(exerciseId: number): SetRow[] {
  const db = getDatabase();
  return db.getAllSync<SetRow>(
    "SELECT * FROM sets WHERE exercise_id = ? ORDER BY id ASC",
    exerciseId
  );
}

export function getLastSessionSets(
  exerciseName: string
): { weight: number; reps: number }[] {
  const db = getDatabase();
  return db.getAllSync<{ weight: number; reps: number }>(
    `SELECT s.weight, s.reps
     FROM sets s
     JOIN exercises e ON s.exercise_id = e.id
     JOIN workouts w ON e.workout_id = w.id
     WHERE e.name = ? AND w.duration > 0
     ORDER BY w.date DESC, s.id ASC
     LIMIT 10`,
    exerciseName
  );
}

export function finishWorkout(workoutId: number, duration: number): void {
  const db = getDatabase();

  const result = db.getFirstSync<{ vol: number }>(
    `SELECT COALESCE(SUM(s.weight * s.reps), 0) as vol
     FROM sets s
     JOIN exercises e ON s.exercise_id = e.id
     WHERE e.workout_id = ?`,
    workoutId
  );

  db.runSync(
    "UPDATE workouts SET duration = ?, total_volume = ? WHERE id = ?",
    duration,
    result?.vol ?? 0,
    workoutId
  );
}

export function getExercisesForWorkout(workoutId: number): ExerciseRow[] {
  const db = getDatabase();
  return db.getAllSync<ExerciseRow>(
    "SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index ASC",
    workoutId
  );
}

export function getRecentWorkouts(limit: number = 20): WorkoutRow[] {
  const db = getDatabase();
  return db.getAllSync<WorkoutRow>(
    "SELECT * FROM workouts WHERE duration > 0 ORDER BY date DESC LIMIT ?",
    limit
  );
}
