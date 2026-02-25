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

## Phase 4: iOS Live Activities
**Status:** Done (2026-02-24)
- **Custom local Expo module** (`modules/live-activity/`) — native bridge for ActivityKit `Activity.request()`, `.update()`, `.end()` via `LiveActivityModule.swift`
- **Shared ActivityKit attributes** (`FlowActivityAttributes.swift`) — exerciseName, exerciseId, deepLinkUrl + ContentState with currentSetNumber, lastSetWeight/Reps, ghostWeight/Reps, isComplete
- **Widget extension** (`targets/widget/`) via `@bacons/apple-targets` — SwiftUI Live Activity views for Lock Screen (Strava-inspired dark theme, orange "Log Set" deep-link button) and Dynamic Island (expanded/compact/minimal)
- **Deep-link interactivity** — "Log Set" button on Live Activity opens `theflowjournal://focused-entry?exerciseId=...&exerciseName=...` (works iOS 16.1+, no App Intents needed)
- **useLiveActivity hook** (`src/hooks/useLiveActivity.ts`) — React Native hook wrapping native module with start/update/end + platform guards
- **Integration** — focused-entry starts activity on mount, updates after each set, ends on Finish Exercise; active-workout ends any lingering activity on workout finish
- **Graceful degradation** — module returns no-ops on Android and when running in Expo Go (try/catch around requireNativeModule)

## Phase 5: TBD
<!-- TODO: Fill in from Gemini conversation -->
