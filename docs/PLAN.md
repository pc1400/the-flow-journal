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

## Phase 3: Workout Summary, Persistence, and Routine Templates
**Status:** Done (2026-02-15)
- **Schema update** — added `notes` column to workouts (ALTER TABLE), created `templates` and `template_exercises` tables
- **New queries** — getWorkoutById, getCompletedSetCount, getTotalVolume, createTemplate, addTemplateExercise, saveWorkoutAsTemplate, getAllTemplates, getTemplateExercises, deleteTemplate
- **WorkoutSummaryModal** — post-workout modal with stats (duration/sets/volume), editable name, notes input, save-as-routine toggle
- **Finish workflow** — "Finish Workout" opens summary modal (workout stays active), "Save & Finish" saves name/notes/template then navigates to History
- **Workout Detail screen** (`app/workout-detail.tsx`) — full completed workout view with exercises, sets, notes, accessed from tappable History cards
- **Routine templates** — "My Routines" horizontal section on History screen, tap to start pre-populated workout from template

## Phase 3.5: UX Polish, Set Pager & CRUD
**Status:** Done (2026-02-15)
- **Timer freeze** — elapsed time freezes when summary modal opens, saved duration matches what user saw
- **Save-as-routine flow** — separate routine naming step via `NameInputModal` after workout save; notes never saved to template
- **Green finished exercises** — exercises with logged sets show green left border + checkmark icon on active-workout screen
- **Haptic feedback** — `expo-haptics` medium impact on Log Set, Reanimated scale pulse + checkmark flash on set counter
- **Set pager** — indicator boxes in focused-entry for all sets; tap to review logged sets (read-only green cards); Log Set only visible on active set
- **Delete workout** — swipe-to-delete on history cards via `Swipeable` from gesture-handler, cascade deletes sets → exercises → workout
- **Delete routine** — long-press routine card → Alert with Delete confirmation
- **Rename routine** — long-press routine card → Alert with Rename option → `NameInputModal`
- **Routine preview** — tap routine shows `RoutinePreviewModal` with exercise list + "Jump into Routine" button

## Phase 4: Feature Pack — Rest Timer, Custom Exercises, Supersets, Bodyweight, Metrics
**Status:** Done (2026-03-02)
**Revised by:** Claude (2026-03-02) — Added 6 features in one batch

- **Schema migrations** — `custom_exercises` table, `metric_type`/`superset_group`/`unit` columns on exercises, `value` column on sets, `metric_type`/`superset_group` on template_exercises
- **Metric types** — `weight_reps`, `bodyweight_reps`, `distance`, `time` with per-exercise unit tracking
- **Extended data model** — `ExerciseDefinition` now includes `metricType`, `isBodyweight`, `defaultUnit`; built-in exercises updated (Push-Up/Pull-Up → bodyweight_reps, Plank → time)
- **Custom exercises** — `CreateExerciseModal` with name/muscle group/metric type pickers; saved to `custom_exercises` table; merged into ExerciseSearch results via `getAllExercises()` helper
- **Metric-aware focused entry** — inputs adapt per metric type: Weight+Reps, Bodyweight+Reps (optional "+ Add Weight" toggle), Distance (m), Time (seconds)
- **Rest timer** — `RestTimer` overlay auto-starts after logging a set (90s countdown), +/- 15s adjustment, haptic buzz on completion, skip button
- **Supersets** — "Link Superset" button enters selection mode with checkboxes; select 2+ exercises → "Create Superset"; grouped rendering with purple left bar and "SUPERSET" label via `SupersetCard`; long-press to ungroup
- **Rename "Finish Exercise" → "Back to Workout"** — button text only, behavior unchanged
- **Volume conditional display** — volume only shown when > 0 (hides for non-weight workouts) in history cards, workout detail, and summary modal
- **Volume calculation** — only sums weight-based exercises (`weight_reps`/`bodyweight_reps`)

## Phase 5: TBD
<!-- TODO: Fill in from Gemini conversation -->
