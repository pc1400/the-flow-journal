export interface ExerciseDefinition {
  name: string;
  muscleGroup: string;
}

export const EXERCISES: ExerciseDefinition[] = [
  // Chest
  { name: "Bench Press", muscleGroup: "Chest" },
  { name: "Incline Bench Press", muscleGroup: "Chest" },
  { name: "Dumbbell Fly", muscleGroup: "Chest" },
  { name: "Push-Up", muscleGroup: "Chest" },
  { name: "Cable Crossover", muscleGroup: "Chest" },

  // Back
  { name: "Barbell Row", muscleGroup: "Back" },
  { name: "Pull-Up", muscleGroup: "Back" },
  { name: "Lat Pulldown", muscleGroup: "Back" },
  { name: "Seated Cable Row", muscleGroup: "Back" },
  { name: "Deadlift", muscleGroup: "Back" },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders" },
  { name: "Lateral Raise", muscleGroup: "Shoulders" },
  { name: "Front Raise", muscleGroup: "Shoulders" },
  { name: "Face Pull", muscleGroup: "Shoulders" },
  { name: "Arnold Press", muscleGroup: "Shoulders" },

  // Legs
  { name: "Squat", muscleGroup: "Legs" },
  { name: "Leg Press", muscleGroup: "Legs" },
  { name: "Romanian Deadlift", muscleGroup: "Legs" },
  { name: "Leg Curl", muscleGroup: "Legs" },
  { name: "Leg Extension", muscleGroup: "Legs" },
  { name: "Calf Raise", muscleGroup: "Legs" },
  { name: "Bulgarian Split Squat", muscleGroup: "Legs" },

  // Arms
  { name: "Barbell Curl", muscleGroup: "Arms" },
  { name: "Hammer Curl", muscleGroup: "Arms" },
  { name: "Tricep Pushdown", muscleGroup: "Arms" },
  { name: "Skull Crusher", muscleGroup: "Arms" },
  { name: "Preacher Curl", muscleGroup: "Arms" },

  // Core
  { name: "Plank", muscleGroup: "Core" },
  { name: "Hanging Leg Raise", muscleGroup: "Core" },
  { name: "Cable Crunch", muscleGroup: "Core" },
];
