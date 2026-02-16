# The Flow Journal

A gym workout tracking app built with React Native / Expo. Think "Strong" app — log exercises, sets, reps, and weight during workouts, then review history.

## Tech Stack

- **Framework:** Expo SDK 54 with expo-router v6 (file-based routing)
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Database:** expo-sqlite (local SQLite)
- **Icons:** lucide-react-native

## Build & Run

```bash
npx expo start          # Start dev server
npx expo start --ios    # iOS simulator
npx expo start --android # Android emulator
npm run lint            # ESLint
```

## Project Structure

```
app/                    # expo-router file-based routes
  _layout.tsx           # Root layout (Stack, DB init)
  (tabs)/
    _layout.tsx         # Tab navigator (History, The Flow)
    index.tsx           # History screen — recent workouts list
    active-workout.tsx  # Active workout screen — timer, exercises, sets
src/
  components/           # Reusable UI components (Card, etc.)
  db/
    db.ts               # SQLite database init + schema
  hooks/                # Custom React hooks
```

## Database Schema

- **workouts** — id, date, name, total_volume, duration
- **exercises** — id, workout_id, name, muscle_group, order_index
- **sets** — id, exercise_id, weight, reps, is_completed, timestamp

## Code Conventions

- Use NativeWind `className` for all styling (no inline StyleSheet objects unless needed for shadows/animations)
- Custom colors defined in `tailwind.config.js`: `background` (#F4F4F4), `primary` (#007AFF), `dark-bg` (#121212)
- Path alias: `@/*` maps to project root (e.g., `@/src/components/Card`)
- Components go in `src/components/`, database logic in `src/db/`, hooks in `src/hooks/`
- Use `SafeAreaView` from `react-native-safe-area-context` for screen wrappers
- Functional components with TypeScript interfaces for props

## Collaboration

This project uses shared coordination files for multi-developer Claude Code sessions.

**Before starting any work, read these files:**
- `docs/PLAN.md` — phased development plan (source of truth for what we're building)
- `docs/TASKS.md` — shared task board (claim tasks, mark done)
- `docs/WORKLOG.md` — recent changes log (know what just happened)

**After finishing work:**
- Update `docs/TASKS.md` (move task to Done)
- Add entry to `docs/WORKLOG.md`
- Update `docs/PLAN.md` if the plan changed (note who, when, and why)
- `git pull --rebase` before pushing

See `.claude/rules/workflow.md` for the full collaboration workflow.
