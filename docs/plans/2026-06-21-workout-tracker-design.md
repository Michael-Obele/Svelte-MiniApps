# Workout Tracker — Design Document

**Date:** 2026-06-21
**Status:** Approved
**Approach:** A — Single route with tabs (matches medication-tracker pattern)

## Requirements Summary

1. **Routine structure**: Named routines, assigned per specific calendar date (flexible per week). Routines support **multi-week periodization** (Week 1 has exercises A/B/C, Week 2 has D/E/F, etc.)
2. **Exercise tracking**: Status (Done Well / Done / Struggled / Skipped) + optional notes per exercise
3. **Day status**: Rest day overrides; otherwise auto-derived from exercise statuses (all done = Done, some skipped = Partial, none done = Missed)
4. **Calendar view**: Both — Week view (expandable days, main) + Month grid view as separate tabs
5. **Exercise library**: Hybrid — reusable library + free-text custom exercises on the fly
6. **Free-form day logging**: Days can have exercises logged without a pre-assigned routine (ad-hoc exercises)
7. **Data storage**: Full pattern — PersistedState (IndexedDB) for local + remote functions with Prisma for cloud sync
8. **Stats**: Stats dashboard — workout streak, completion rate, done well vs struggled, rest day count
9. **Recurring**: Per-date assignment + repeat options (none, weekly, biweekly, custom interval)

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
	category?: string; // e.g., "Chest", "Back", "Legs" — optional
	createdAt: string;
}

// A named routine (e.g., "Push Day", "Pull Day")
// Supports multi-week periodization: weeks[0] = Week 1 exercises, weeks[1] = Week 2, etc.
// Single-week routines have weeks.length === 1
interface Routine {
	id: string;
	name: string;
	description?: string;
	weeks: RoutineExercise[][]; // multi-week support; weeks[0] = Week 1
	createdAt: string;
	updatedAt: string;
}

// Exercise reference within a routine week (hybrid: library ref OR free-text)
interface RoutineExercise {
	id: string;
	exerciseId?: string; // if picked from library
	customName?: string; // if free-text custom
	label: string; // resolved display name
}

// Assignment of a routine to a calendar date
interface DayAssignment {
	id: string;
	date: string; // ISO date "2026-06-21"
	routineId: string | null; // null = rest day OR free-form day (no routine)
	isRestDay: boolean;
	isFreeForm: boolean; // true = ad-hoc exercises, no routine assigned
	routineWeekIndex?: number; // for multi-week routines: which week (0-based) to use for this date
	repeatType: 'none' | 'weekly' | 'biweekly' | 'custom';
	repeatInterval?: number; // for custom (every N days)
	repeatEndDate?: string; // optional stop date for repeats
	createdAt: string;
	updatedAt: string;
}

// Per-exercise log for a specific date
// Covers both routine-based exercises AND free-form ad-hoc exercises
interface WorkoutLog {
	id: string;
	date: string; // ISO date
	exerciseLabel: string; // snapshot of the exercise name
	status: 'done_well' | 'done' | 'struggled' | 'skipped';
	notes?: string;
	source: 'routine' | 'freeform'; // whether this came from a routine or was added ad-hoc
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
- `WorkoutDayAssignment.isFreeForm` — true for ad-hoc days with no routine
- `WorkoutDayAssignment.routineWeekIndex` — which week of a multi-week routine to use (0-based)
- `WorkoutLog.exerciseLabel` snapshots the label so logs stay readable if routines change
- `WorkoutLog.source` — 'routine' or 'freeform' to track origin
- `WorkoutRoutineExercise.sortOrder` maintains exercise ordering within a week
- `WorkoutRoutineExercise.weekIndex` — which week of a multi-week routine (0-based)

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
- `getExercisesForDay(date)` — resolves exercises for a date: routine week exercises (if assigned) OR free-form logs (if ad-hoc day)

Day status derivation:

- No assignment → 'none'
- `isRestDay` → 'rest'
- No logs → 'missed'
- All logs non-skipped → 'done'
- Some logs non-skipped → 'partial'
- All logs skipped → 'missed'

**Free-form days:** A day with `isFreeForm = true` has no routine. Exercises are added directly as `WorkoutLog` entries with `source: 'freeform'`. Day status derives the same way from logs.

### Cloud Sync (mirrors medication-tracker)

- `loadWorkoutData` query — loads all 4 collections for authenticated user
- `saveWorkoutData` command — bulk upsert with Valibot validation
- On mount: merge server data with local using timestamp-based conflict resolution
- Auto-backup with debounced timer for authenticated users
- Guest users: local-only, no sync

## UI Components

### Week View (default tab)

- 7 day cards in vertical list (current week), week navigation arrows + "This Week" button
- Each card: date, weekday, status badge, routine name (or "Free-form" / "Rest Day"), exercise count summary
- Click to expand inline → DayDetail with exercise list + status toggles
- Empty days: "Assign Routine" button → Dialog with 3 options: pick routine, free-form day, or rest day

### Month View

- Full month grid (7 columns), month navigation, "Today" button
- Each cell: date number + color dot (green/amber/red/blue/none)
- Click day → DayDetail in Dialog
- Uses shadcn-svelte Calendar component with custom day cell rendering

### Day Detail

- Shows assigned routine name + date (or "Free-form Day" / "Rest Day" label)
- **Routine days:** Exercise list from the routine's week (based on `routineWeekIndex`), with 4-button status toggle (Done Well/Done/Struggled/Skipped) + collapsible notes per exercise
- **Free-form days:** Empty exercise list with "Add Exercise" button — type any exercise name ad-hoc, then log status + notes. Added exercises can optionally be saved to the library
- "Mark as Rest Day" button (overrides routine/free-form, hides exercises)
- "Change Routine" button → swap to a different routine, switch to free-form, or remove assignment
- For multi-week routines: week selector dropdown to pick which week's exercises to use for this date

### Routines Tab

- Routine list cards (name, week count, total exercise count, edit/delete)
- Routine builder: name, description, **week tabs/selector** (Week 1, Week 2, Add Week), exercise list with reorder per week
- Add exercise: combobox picker (search library OR type custom name)
- "Save to library" checkbox for custom exercises
- Exercise library section with category tags
- Multi-week routines: each week has its own exercise list; when assigned to a date, user picks which week to use

### Stats Tab

- Streak card (Flame icon)
- Completion rate card (TrendingUp icon)
- Exercise quality breakdown (ListChecks icon)
- Rest day count (CalendarDays icon)
- Time range selector: This week / This month / All time

## Icon Mapping

| Feature      | Lucide Icon  |
| ------------ | ------------ |
| App icon     | Dumbbell     |
| Week tab     | Calendar     |
| Month tab    | CalendarDays |
| Routines tab | ListChecks   |
| Stats tab    | TrendingUp   |
| Done Well    | CircleCheck  |
| Done         | Check        |
| Struggled    | Activity     |
| Skipped      | CircleX      |
| Rest day     | Minus        |
| Streak       | Flame        |
| Add          | Plus         |
| Repeat       | Repeat       |
| Settings     | Settings     |

## Testing

- **Unit tests** (`page.test.ts`): getDayStatus, getWorkoutStreak, getCompletionRate, getQualityBreakdown, repeat expansion, getExercisesForDay (routine + free-form), multi-week routine week selection
- **Quality gates:** `bun check` + `svelte-autofixer` + `prettier`

## Migration

1. Add models to `schema.prisma`
2. `npm run db:migrate -- --name add_workout_tracker`
3. `npm run db:push`
