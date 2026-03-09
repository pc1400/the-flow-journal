export type MetricType = 'weight_reps' | 'bodyweight_reps' | 'distance' | 'time';

export interface ExerciseDefinition {
  name: string;
  muscleGroup: string;
  metricType: MetricType;
  isBodyweight: boolean;
  defaultUnit: 'lbs' | 'kg' | 'm' | 's';
}

export const EXERCISES: ExerciseDefinition[] = [
  // Chest
  { name: "Bench Press", muscleGroup: "Chest", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Incline Bench Press", muscleGroup: "Chest", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Dumbbell Fly", muscleGroup: "Chest", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Push-Up", muscleGroup: "Chest", metricType: "bodyweight_reps", isBodyweight: true, defaultUnit: "lbs" },
  { name: "Cable Crossover", muscleGroup: "Chest", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },

  // Back
  { name: "Barbell Row", muscleGroup: "Back", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Pull-Up", muscleGroup: "Back", metricType: "bodyweight_reps", isBodyweight: true, defaultUnit: "lbs" },
  { name: "Lat Pulldown", muscleGroup: "Back", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Seated Cable Row", muscleGroup: "Back", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Deadlift", muscleGroup: "Back", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Lateral Raise", muscleGroup: "Shoulders", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Front Raise", muscleGroup: "Shoulders", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Face Pull", muscleGroup: "Shoulders", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Arnold Press", muscleGroup: "Shoulders", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },

  // Legs
  { name: "Squat", muscleGroup: "Legs", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Leg Press", muscleGroup: "Legs", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Romanian Deadlift", muscleGroup: "Legs", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Leg Curl", muscleGroup: "Legs", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Leg Extension", muscleGroup: "Legs", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Calf Raise", muscleGroup: "Legs", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Bulgarian Split Squat", muscleGroup: "Legs", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },

  // Arms
  { name: "Barbell Curl", muscleGroup: "Arms", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Hammer Curl", muscleGroup: "Arms", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Tricep Pushdown", muscleGroup: "Arms", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Skull Crusher", muscleGroup: "Arms", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
  { name: "Preacher Curl", muscleGroup: "Arms", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },

  // Core
  { name: "Plank", muscleGroup: "Core", metricType: "time", isBodyweight: true, defaultUnit: "s" },
  { name: "Hanging Leg Raise", muscleGroup: "Core", metricType: "bodyweight_reps", isBodyweight: true, defaultUnit: "lbs" },
  { name: "Cable Crunch", muscleGroup: "Core", metricType: "weight_reps", isBodyweight: false, defaultUnit: "lbs" },
];

export interface CustomExerciseRow {
  id: number;
  name: string;
  muscle_group: string;
  metric_type: string;
  is_bodyweight: number;
  created_at: string;
}

export function getAllExercises(customExercises: CustomExerciseRow[]): ExerciseDefinition[] {
  const customs: ExerciseDefinition[] = customExercises.map((ce) => ({
    name: ce.name,
    muscleGroup: ce.muscle_group,
    metricType: ce.metric_type as MetricType,
    isBodyweight: ce.is_bodyweight === 1,
    defaultUnit: getDefaultUnit(ce.metric_type as MetricType),
  }));
  return [...EXERCISES, ...customs];
}

function getDefaultUnit(metricType: MetricType): 'lbs' | 'kg' | 'm' | 's' {
  switch (metricType) {
    case 'distance': return 'm';
    case 'time': return 's';
    default: return 'lbs';
  }
}
