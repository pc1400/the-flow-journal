# Development Plan

> **How to use this file:** This is the source of truth for what we're building and in what order. Update it when a phase is revised (note who revised it and when). Paste this into Gemini at the start of a new session to preserve context.

## Phase 1: Skeleton Screens & DB Schema
**Status:** Done (2026-02-15)
- Expo SDK 54 project with expo-router v6, NativeWind v4, SQLite
- Tab navigation: History + The Flow
- SQLite schema: workouts, exercises, sets tables
- Skeleton screens with empty states and Card component

## Phase 2: Focused Entry Mode
**Status:** Done (2026-02-15)
- **WorkoutContext** — React Context managing active workout state (workout ID, exercises, sets), wrapping DB queries
- **Database queries** (`src/db/queries.ts`) — createWorkout, addExercise, logSet, getSetsForExercise, getLastSessionSets, finishWorkout, getRecentWorkouts
- **Exercise library** (`src/data/exercises.ts`) — 30 common exercises across 6 muscle groups
- **Ghost values** (`src/hooks/useExerciseHistory.ts`) — fetches last session's weight/reps for placeholder hints
- **ExerciseSearch modal** — searchable exercise picker with filter by name/muscle group
- **ExerciseCard** — tappable card showing exercise name, muscle group, and set count
- **Focused Entry screen** (`app/focused-entry.tsx`) — full-screen set logging with large inputs, ghost placeholders, "Log Set" and "Finish Exercise" buttons
- **Active Workout screen** — live timer, exercise list via FlatList, Add Exercise + Finish Workout buttons
- **History screen** — "Start Empty Workout" creates workout and navigates to active tab, recent workouts list from DB

## Phase 3: TBD
<!-- TODO: Fill in from Gemini conversation -->

## Phase 4: TBD
<!-- TODO: Fill in from Gemini conversation -->
