import { getDatabase } from "./db";
import { CustomExerciseRow } from "@/src/data/exercises";

export interface SetRow {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  value: number;
  is_completed: number;
  timestamp: string | null;
}

export interface ExerciseRow {
  id: number;
  workout_id: number;
  name: string;
  muscle_group: string | null;
  order_index: number;
  metric_type: string;
  superset_group: number | null;
  unit: string;
}

export interface WorkoutRow {
  id: number;
  date: string;
  name: string;
  total_volume: number;
  duration: number;
  notes: string;
}

export interface TemplateRow {
  id: number;
  name: string;
  notes: string;
}

export interface TemplateExerciseRow {
  id: number;
  template_id: number;
  exercise_name: string;
  muscle_group: string | null;
  order_index: number;
  metric_type: string;
  superset_group: number | null;
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
  orderIndex: number,
  metricType: string = "weight_reps",
  unit: string = "lbs"
): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO exercises (workout_id, name, muscle_group, order_index, metric_type, unit) VALUES (?, ?, ?, ?, ?, ?)",
    workoutId,
    name,
    muscleGroup,
    orderIndex,
    metricType,
    unit
  );
  return result.lastInsertRowId;
}

export function logSet(
  exerciseId: number,
  weight: number,
  reps: number,
  value: number = 0
): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO sets (exercise_id, weight, reps, value, is_completed, timestamp) VALUES (?, ?, ?, ?, 1, ?)",
    exerciseId,
    weight,
    reps,
    value,
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
): { weight: number; reps: number; value: number }[] {
  const db = getDatabase();
  return db.getAllSync<{ weight: number; reps: number; value: number }>(
    `SELECT s.weight, s.reps, s.value
     FROM sets s
     JOIN exercises e ON s.exercise_id = e.id
     JOIN workouts w ON e.workout_id = w.id
     WHERE e.name = ? AND w.duration > 0
     ORDER BY w.date DESC, s.id ASC
     LIMIT 10`,
    exerciseName
  );
}

export function finishWorkout(
  workoutId: number,
  duration: number,
  name?: string,
  notes?: string
): void {
  const db = getDatabase();

  // Only sum volume for weight_reps and bodyweight_reps metrics
  const result = db.getFirstSync<{ vol: number }>(
    `SELECT COALESCE(SUM(s.weight * s.reps), 0) as vol
     FROM sets s
     JOIN exercises e ON s.exercise_id = e.id
     WHERE e.workout_id = ? AND e.metric_type IN ('weight_reps', 'bodyweight_reps')`,
    workoutId
  );

  db.runSync(
    "UPDATE workouts SET duration = ?, total_volume = ?, name = ?, notes = ? WHERE id = ?",
    duration,
    result?.vol ?? 0,
    name ?? "Workout",
    notes ?? "",
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

export function getWorkoutById(workoutId: number): WorkoutRow | null {
  const db = getDatabase();
  return db.getFirstSync<WorkoutRow>(
    "SELECT * FROM workouts WHERE id = ?",
    workoutId
  );
}

export function getCompletedSetCount(workoutId: number): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sets s
     JOIN exercises e ON s.exercise_id = e.id
     WHERE e.workout_id = ? AND s.is_completed = 1`,
    workoutId
  );
  return result?.count ?? 0;
}

export function getTotalVolume(workoutId: number): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ vol: number }>(
    `SELECT COALESCE(SUM(s.weight * s.reps), 0) as vol
     FROM sets s
     JOIN exercises e ON s.exercise_id = e.id
     WHERE e.workout_id = ? AND e.metric_type IN ('weight_reps', 'bodyweight_reps')`,
    workoutId
  );
  return result?.vol ?? 0;
}

export function createTemplate(name: string, notes: string): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO templates (name, notes) VALUES (?, ?)",
    name,
    notes
  );
  return result.lastInsertRowId;
}

export function addTemplateExercise(
  templateId: number,
  exerciseName: string,
  muscleGroup: string,
  orderIndex: number,
  metricType: string = "weight_reps",
  supersetGroup: number | null = null
): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO template_exercises (template_id, exercise_name, muscle_group, order_index, metric_type, superset_group) VALUES (?, ?, ?, ?, ?, ?)",
    templateId,
    exerciseName,
    muscleGroup,
    orderIndex,
    metricType,
    supersetGroup
  );
  return result.lastInsertRowId;
}

export function saveWorkoutAsTemplate(
  workoutId: number,
  name: string,
  notes: string
): number {
  const exercises = getExercisesForWorkout(workoutId);
  const templateId = createTemplate(name, notes);
  for (const ex of exercises) {
    addTemplateExercise(
      templateId,
      ex.name,
      ex.muscle_group ?? "",
      ex.order_index,
      ex.metric_type ?? "weight_reps",
      ex.superset_group
    );
  }
  return templateId;
}

export function getAllTemplates(): TemplateRow[] {
  const db = getDatabase();
  return db.getAllSync<TemplateRow>("SELECT * FROM templates ORDER BY id DESC");
}

export function getTemplateExercises(templateId: number): TemplateExerciseRow[] {
  const db = getDatabase();
  return db.getAllSync<TemplateExerciseRow>(
    "SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index ASC",
    templateId
  );
}

export function deleteTemplate(templateId: number): void {
  const db = getDatabase();
  db.runSync("DELETE FROM template_exercises WHERE template_id = ?", templateId);
  db.runSync("DELETE FROM templates WHERE id = ?", templateId);
}

export function deleteWorkout(workoutId: number): void {
  const db = getDatabase();
  db.runSync(
    "DELETE FROM sets WHERE exercise_id IN (SELECT id FROM exercises WHERE workout_id = ?)",
    workoutId
  );
  db.runSync("DELETE FROM exercises WHERE workout_id = ?", workoutId);
  db.runSync("DELETE FROM workouts WHERE id = ?", workoutId);
}

export function updateTemplateName(templateId: number, name: string): void {
  const db = getDatabase();
  db.runSync("UPDATE templates SET name = ? WHERE id = ?", name, templateId);
}

// Custom exercises
export function createCustomExercise(
  name: string,
  muscleGroup: string,
  metricType: string,
  isBodyweight: boolean
): number {
  const db = getDatabase();
  const result = db.runSync(
    "INSERT INTO custom_exercises (name, muscle_group, metric_type, is_bodyweight, created_at) VALUES (?, ?, ?, ?, ?)",
    name,
    muscleGroup,
    metricType,
    isBodyweight ? 1 : 0,
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export function getAllCustomExercises(): CustomExerciseRow[] {
  const db = getDatabase();
  return db.getAllSync<CustomExerciseRow>(
    "SELECT * FROM custom_exercises ORDER BY name ASC"
  );
}

export function deleteCustomExercise(id: number): void {
  const db = getDatabase();
  db.runSync("DELETE FROM custom_exercises WHERE id = ?", id);
}

// Exercise updates
export function updateExerciseUnit(exerciseId: number, unit: string): void {
  const db = getDatabase();
  db.runSync("UPDATE exercises SET unit = ? WHERE id = ?", unit, exerciseId);
}

export function batchUpdateExerciseOrder(
  updates: { id: number; orderIndex: number }[]
): void {
  const db = getDatabase();
  for (const u of updates) {
    db.runSync(
      "UPDATE exercises SET order_index = ? WHERE id = ?",
      u.orderIndex,
      u.id
    );
  }
}

// Supersets
export function updateSupersetGroup(
  exerciseId: number,
  group: number | null
): void {
  const db = getDatabase();
  db.runSync(
    "UPDATE exercises SET superset_group = ? WHERE id = ?",
    group,
    exerciseId
  );
}

export function getNextSupersetGroup(workoutId: number): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ max_group: number | null }>(
    "SELECT MAX(superset_group) as max_group FROM exercises WHERE workout_id = ?",
    workoutId
  );
  return (result?.max_group ?? 0) + 1;
}
