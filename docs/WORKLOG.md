# Work Log

## 2026-03-02 — Claude (Phase 4.5: UX — Unit Picker, Superset Auto-Advance, Drag Reorder)
- Updated `src/db/queries.ts` — added `updateExerciseUnit` and `batchUpdateExerciseOrder` functions
- Updated `src/context/WorkoutContext.tsx` — added `updateExerciseUnit` (persists unit change per exercise) and `reorderExercises` (reorders state + persists via batch update)
- Updated `app/focused-entry.tsx` — tappable lbs/kg unit pill on weight inputs, superset auto-advance (auto-jumps to next exercise after 600ms), rest timer carries across navigation via `restTimerStartedAt` param, "Next: {name}" hint shown in supersets
- Updated `src/components/RestTimer.tsx` — added `startedAt` prop for computing initial remaining time when timer carries across screens
- Updated `app/(tabs)/active-workout.tsx` — replaced ScrollView with `DraggableExerciseList`, removed "Link Superset" selection mode (selectMode, selectedIds, handleToggleSelect, handleCreateSuperset buttons), passes `supersetGroup` in route params
- Created `src/components/DraggableExerciseList.tsx` — gesture-based drag list using react-native-gesture-handler Pan with long-press activation; supports drag-to-reorder (blue insertion line) and drag-to-merge-superset (purple highlight + "Drop to superset" hint); superset groups drag as a unit
- Updated `src/components/ExerciseCard.tsx` — removed `selectable`/`selected`/`onToggleSelect` props
- Updated `src/components/SupersetCard.tsx` — removed `selectable`/`selectedIds`/`onToggleSelect` props

## 2026-03-02 — Claude (Phase 4: Feature Pack — Rest Timer, Custom Exercises, Supersets, Metrics)
- Updated `src/db/db.ts` — added `custom_exercises` table, ALTER TABLE migrations for `metric_type`, `superset_group`, `unit` on exercises, `value` on sets, `metric_type`/`superset_group` on template_exercises
- Updated `src/data/exercises.ts` — extended `ExerciseDefinition` with `metricType`, `isBodyweight`, `defaultUnit`; marked Push-Up/Pull-Up/Hanging Leg Raise as bodyweight_reps, Plank as time; added `CustomExerciseRow` interface and `getAllExercises()` merge helper
- Updated `src/db/queries.ts` — added `value` to SetRow, `metric_type`/`superset_group`/`unit` to ExerciseRow/TemplateExerciseRow; updated `addExercise`/`logSet`/`getLastSessionSets`/`finishWorkout`/`getTotalVolume`/`saveWorkoutAsTemplate`/`addTemplateExercise` for new columns; added `createCustomExercise`, `getAllCustomExercises`, `deleteCustomExercise`, `updateSupersetGroup`, `getNextSupersetGroup`
- Updated `src/context/WorkoutContext.tsx` — added `value` to WorkoutSet; added `metricType`/`unit`/`supersetGroup` to WorkoutExercise; updated `addExercise`/`logSet` signatures; added `createSupersetFromExercises`/`removeSupersetGroup` methods
- Updated `src/hooks/useExerciseHistory.ts` — added `value` to GhostSet interface
- Updated `app/focused-entry.tsx` — metric-aware inputs (weight_reps, bodyweight_reps with "+ Add Weight" toggle, distance, time); rest timer auto-starts after Log Set; renamed "Finish Exercise" → "Back to Workout"
- Created `src/components/RestTimer.tsx` — full-screen overlay with countdown, +/- 15s buttons, skip button, haptic buzz on completion
- Created `src/components/CreateExerciseModal.tsx` — modal with name/muscle group/metric type pickers, validates uniqueness
- Updated `src/components/ExerciseSearch.tsx` — loads custom exercises from DB on mount, merges with builtins, "Create Custom Exercise" button always visible
- Updated `src/components/ExerciseCard.tsx` — added `selectable`/`selected`/`onToggleSelect` props for superset selection mode with checkbox icons
- Created `src/components/SupersetCard.tsx` — wraps multiple ExerciseCards with purple left border and "SUPERSET" label, long-press to ungroup
- Updated `app/(tabs)/active-workout.tsx` — passes `metricType`/`unit` to focused-entry; superset selection mode with "Link Superset" button, grouped exercise rendering via `useMemo`, "Create Superset" and "Cancel" buttons
- Updated `app/workout-detail.tsx` — formats sets per metric type (weight×reps, BW×reps, distance m, time s); conditional volume display
- Updated `app/(tabs)/index.tsx` — conditional volume display in history cards (hidden when 0)
- Updated `src/components/WorkoutSummaryModal.tsx` — conditional volume stat (hidden when 0), added "lbs" label

## 2026-02-15 — Claude (Phase 3.5: UX Polish, Set Pager & CRUD)
- Updated `src/context/WorkoutContext.tsx` — `finishWorkout` now accepts optional explicit duration param
- Updated `app/(tabs)/active-workout.tsx` — frozenElapsed state freezes timer when summary modal opens; separate routine naming flow via NameInputModal after workout save
- Created `src/components/NameInputModal.tsx` — reusable modal for text input (routine naming + renaming)
- Updated `src/components/ExerciseCard.tsx` — green left border + CheckCircle2 icon when sets are logged
- Updated `app/focused-entry.tsx` — haptic feedback on Log Set (expo-haptics), Reanimated scale pulse + checkmark flash on counter, set pager with indicator boxes (tap to review logged sets read-only, Log Set only on active set)
- Updated `src/db/queries.ts` — added deleteWorkout (cascade delete sets→exercises→workout), updateTemplateName
- Created `src/components/RoutinePreviewModal.tsx` — preview modal showing routine exercises before starting
- Updated `app/(tabs)/index.tsx` — swipe-to-delete workouts (Swipeable), long-press routines for Rename/Delete, tap routine opens preview modal
- Updated `app/_layout.tsx` — wrapped root layout with GestureHandlerRootView for swipe gestures

## 2026-02-15 — Claude (Phase 3: Workout Summary, Persistence & Routines)
- Updated `src/db/db.ts` — added `notes` column to workouts (ALTER TABLE), created `templates` and `template_exercises` tables
- Updated `src/db/queries.ts` — added `notes` to WorkoutRow, updated finishWorkout to accept name/notes, added template CRUD functions (createTemplate, addTemplateExercise, saveWorkoutAsTemplate, getAllTemplates, getTemplateExercises, deleteTemplate), added getWorkoutById, getCompletedSetCount, getTotalVolume
- Updated `src/context/WorkoutContext.tsx` — finishWorkout now accepts name/notes params, added startWorkoutFromTemplate
- Created `src/components/WorkoutSummaryModal.tsx` — post-workout modal with duration/sets/volume stats, name input, notes input, save-as-routine toggle, Save & Finish button
- Updated `app/(tabs)/active-workout.tsx` — Finish Workout opens summary modal (workout stays active), Save & Finish saves data + optionally creates template + navigates to History
- Created `app/workout-detail.tsx` — full workout detail screen showing name, date, duration, volume, notes, exercises with sets
- Updated `app/_layout.tsx` — registered workout-detail Stack.Screen
- Updated `app/(tabs)/index.tsx` — history cards are tappable (navigate to workout-detail), added "My Routines" horizontal ScrollView section with template cards

## 2026-02-15 — Claude (Post-Phase 2 fix)
- Fixed focused-entry keyboard overlap — wrapped content in KeyboardAvoidingView + ScrollView so buttons stay tappable when keyboard is open

## 2026-02-15 — Claude (Phase 2: Focused Entry Mode)
- Created `src/db/queries.ts` with all DB query functions (createWorkout, addExercise, logSet, getSetsForExercise, getLastSessionSets, finishWorkout, getRecentWorkouts)
- Created `src/data/exercises.ts` with 30 common exercises across 6 muscle groups
- Created `src/hooks/useExerciseHistory.ts` hook for ghost value placeholders
- Created `src/context/WorkoutContext.tsx` with React Context for active workout state management
- Created `src/components/ExerciseSearch.tsx` — modal with searchable exercise picker
- Created `src/components/ExerciseCard.tsx` — tappable card with exercise name + set count
- Created `app/focused-entry.tsx` — full-screen set logging with large inputs and ghost values
- Updated `app/_layout.tsx` — added WorkoutProvider and focused-entry Stack screen
- Updated `app/(tabs)/active-workout.tsx` — live timer, exercise list, Add Exercise + Finish Workout
- Updated `app/(tabs)/index.tsx` — Start Empty Workout wired to context, recent workouts list from DB

## 2026-02-15 — Patrick
- Initialized Expo SDK 54 project with expo-router and NativeWind v4
- Set up SQLite database with workouts/exercises/sets tables
- Built History screen with "Start Empty Workout" button and empty state
- Built Active Workout screen with duration display and "Add Exercise" button
- Configured tab navigation (History + The Flow) with lucide icons
- Created reusable Card component with shadow styling
- Set up collaboration files (CLAUDE.md, TASKS.md, WORKLOG.md, workflow rules)
