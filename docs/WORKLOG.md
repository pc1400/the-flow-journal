# Work Log

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
