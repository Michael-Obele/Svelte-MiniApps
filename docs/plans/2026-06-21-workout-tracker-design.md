# Workout Tracker — Design Document

**Date:** 2026-06-21
**Status:** Approved
**Approach:** A — Single route with tabs (matches medication-tracker pattern)

## Requirements Summary

1. **Routine structure**: Named routines, assigned per specific calendar date (flexible per week)
2. **Exercise tracking**: Status (Done Well / Done / Struggled / Skipped) + optional notes per exercise
3. **Day status**: Rest day overrides; otherwise auto-derived from exercise statuses (all done = Done, some skipped = Partial, none done = Missed)
4. **Calendar view**: Both — Week view (expandable days, main) + Month grid view as separate tabs
5. **Exercise library**: Hybrid — reusable library + free-text custom exercises on the fly
6. **Data storage**: Full pattern — PersistedState (IndexedDB) for local + remote functions with Prisma for cloud sync
7. **Stats**: Stats dashboard — workout streak, completion rate, done well vs struggled, rest day count
8. **Recurring**: Per-date assignment + repeat options (none, weekly, biweekly, custom interval)

## Architecture

Single route `/apps/workout-tracker` with `Tabs.Root` for 4 views:
- **Week** (default) — 7-day vertical list, expandable day cards
- **Month** — full month grid with color-coded status dots
- **Routines** — routine builder + exercise library management
- **Stats** — dashboard with streak, completion rate, quality breakdown, rest count

## File Structure

```
src/routes/apps/(app)/workout-tracker/
├── +page.svelte              # Main page with tabs
├── +page.server.ts           # Load user data from server
├── states.svelte.ts          # PersistedState stores + types + business logic
├── persisted-config.svelte.ts # hasSeenGuide flag
├── how-to-use-config.ts      # Help documentation config
├── page.test.ts              # Unit tests
└── components/
    ├── index.ts              # Barrel exports
    ├── WeekView.svelte       # 7-day vertical list, expandable days
    ├── MonthView.svelte      # Month grid with color-coded day dots
    ├── DayDetail.svelte      # Day exercises + status logging (panel/dialog)
    ├── RoutineBuilder.svelte # Create/edit routines, add exercises
    ├── ExerciseLibrary.svelte # Manage reusable exercise library
    ├── StatsView.svelte      # Streak, completion rate, quality, rest count
    └── HowToUseDialog.svelte # First-time guide
```

**Remote & server:**
```
src/lib/remote/workout-tracker.remote.ts  # query() + command() functions
src/lib/remote/index.ts                   # Add exports
prisma/schema.prisma                       # Add 5 models + User relations
```

**App registration:**
- `src/lib/index.svelte.ts` — add to `done()` array + `projects()` array with `Dumbbell` icon

## Data Model (TypeScript)

```typescript
// Exercise in the reusable library
interface Exercise {
  id: string;
  name: string;
  category?: string;      // e.g., "Chest", "Back", "Legs" — optional
  createdAt: string;
}

// A named routine (e.g., "Push Day", "Pull Day")
interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

// Exercise reference within a routine (hybrid: library ref OR free-text)
interface RoutineExercise {
  id: string;
  exerciseId?: string;   // if picked from library
  customName?: string;    // if free-text custom
  label: string;          // resolved display name
}

// Assignment of a routine to a calendar date
interface DayAssignment {
  id: string;
  date: string;           // ISO date "2026-06-21"
  routineId: string | null;  // null = rest day
  isRestDay: boolean;
  repeatType: 'none' | 'weekly' | 'biweekly' | 'custom';
  repeatInterval?: number;   // for custom (every N days)
  repeatEndDate?: string;    // optional stop date for repeats
  createdAt: string;
  updatedAt: string;
}

// Per-exercise log for a specific date
interface WorkoutLog {
  id: string;
  date: string;           // ISO date
  exerciseLabel: string;  // snapshot of the exercise name
  status: 'done_well' | 'done' | 'struggled' | 'skipped';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Prisma Models

5 new models: `WorkoutExercise`, `WorkoutRoutine`, `WorkoutRoutineExercise`, `WorkoutDayAssignment`, `WorkoutLog`.

All linked to `User` via `userId` with `onDelete: Cascade`.

Key fields:
- `WorkoutDayAssignment.date` is a string (ISO date) for easy filtering
- `WorkoutDayAssignment.repeatType` supports none/weekly/biweekly/custom
- `WorkoutLog.exerciseLabel` snapshots the label so logs stay readable if routines change
- `WorkoutRoutineExercise.sortOrder` maintains exercise ordering

User model additions:
```prisma
workoutExercises      WorkoutExercise[]
workoutRoutines       WorkoutRoutine[]
workoutDayAssignments WorkoutDayAssignment[]
workoutLogs           WorkoutLog[]
```

## State Management & Sync

### Local State (PersistedState / IndexedDB)

4 `PersistedState` stores: `exercises`, `routines`, `dayAssignments`, `workoutLogs`.

### Business Logic (derived functions)

- `getDayStatus(date)` — returns 'rest' | 'done' | 'partial' | 'missed' | 'none'
- `getAssignmentsForDateRange(start, end)` — expands repeat assignments into visible dates
- `getWorkoutStreak()` — consecutive workout days
- `getCompletionRate(range)` — percentage of assigned days completed
- `getQualityBreakdown(range)` — counts of done_well/done/struggled/skipped

Day status derivation:
- No assignment → 'none'
- `isRestDay` → 'rest'
- No logs → 'missed'
- All logs non-skipped → 'done'
- Some logs non-skipped → 'partial'
- All logs skipped → 'missed'

### Cloud Sync (mirrors medication-tracker)

- `loadWorkoutData` query — loads all 4 collections for authenticated user
- `saveWorkoutData` command — bulk upsert with Valibot validation
- On mount: merge server data with local using timestamp-based conflict resolution
- Auto-backup with debounced timer for authenticated users
- Guest users: local-only, no sync

## UI Components

### Week View (default tab)
- 7 day cards in vertical list (current week), week navigation arrows + "This Week" button
- Each card: date, weekday, status badge, routine name, exercise count summary
- Click to expand inline → DayDetail with exercise list + status toggles
- Empty days: "Assign Routine" button → Dialog to pick routine or mark rest

### Month View
- Full month grid (7 columns), month navigation, "Today" button
- Each cell: date number + color dot (green/amber/red/blue/none)
- Click day → DayDetail in Dialog
- Uses shadcn-svelte Calendar component with custom day cell rendering

### Day Detail
- Shows assigned routine name + date
- Exercise list with 4-button status toggle (Done Well/Done/Struggled/Skipped)
- Collapsible notes textarea per exercise
- "Mark as Rest Day" button (overrides routine)
- "Change Routine" button

### Routines Tab
- Routine list cards (name, exercise count, edit/delete)
- Routine builder: name, description, exercise list with reorder
- Add exercise: combobox picker (search library OR type custom name)
- "Save to library" checkbox for custom exercises
- Exercise library section with category tags

### Stats Tab
- Streak card (Flame icon)
- Completion rate card (TrendingUp icon)
- Exercise quality breakdown (ListChecks icon)
- Rest day count (CalendarDays icon)
- Time range selector: This week / This month / All time

## Icon Mapping

| Feature | Lucide Icon |
|---------|-------------|
| App icon | Dumbbell |
| Week tab | Calendar |
| Month tab | CalendarDays |
| Routines tab | ListChecks |
| Stats tab | TrendingUp |
| Done Well | CircleCheck |
| Done | Check |
| Struggled | Activity |
| Skipped | CircleX |
| Rest day | Minus |
| Streak | Flame |
| Add | Plus |
| Repeat | Repeat |
| Settings | Settings |

## Testing

- **Unit tests** (`page.test.ts`): getDayStatus, getWorkoutStreak, getCompletionRate, getQualityBreakdown, repeat expansion
- **Quality gates:** `bun check` + `svelte-autofixer` + `prettier`

## Migration

1. Add models to `schema.prisma`
2. `npm run db:migrate -- --name add_workout_tracker`
3. `npm run db:push`