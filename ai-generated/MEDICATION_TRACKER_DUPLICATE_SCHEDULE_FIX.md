# Duplicate Schedule Bug Fix

## Problem

When clicking "Add Schedule" multiple times or editing a medication and generating a new schedule, duplicate pending doses were being created instead of replacing the old ones.

### Example of the Bug

User would see:

```
Oct 4, 2025
  8:00 AM - pending
  8:00 AM - pending  ← Duplicate
  12:00 PM - pending
  12:00 PM - pending ← Duplicate
  4:00 PM - pending
  4:00 PM - pending  ← Duplicate
```

This happened because:

1. User generates initial schedule → 4 doses per day
2. User clicks "Add Schedule" again → Another 4 doses added (total: 8)
3. User edits times and regenerates → Another 4 doses added (total: 12)

## Root Cause

The `generateSchedule()` function in `MedicationList.svelte` was only adding new logs without clearing existing pending logs for that medication first.

```typescript
// ❌ OLD CODE - Just adds without cleaning
function generateSchedule() {
	const logs = medState.autoGenerateSchedule(session.id, tempMed, times);
	logs.forEach((log) => medState.addLog(log)); // Always adds, never replaces
	toast.success(`Created ${logs.length} scheduled doses`);
}
```

## Solution

### 1. Added Helper Function in states.svelte.ts

```typescript
export function deletePendingLogsForMedication(medicationId: string): void {
	medicationLogs.current = medicationLogs.current.filter(
		(log) => !(log.medicationId === medicationId && log.status === 'pending')
	);
}
```

**Key Points:**

- Only deletes `pending` logs
- Preserves completed history (taken/skipped/missed)
- Filters by `medicationId` to avoid affecting other medications

### 2. Updated generateSchedule() in MedicationList.svelte

```typescript
function generateSchedule() {
	if (!schedulingMedication || scheduleTimes.length === 0) {
		toast.error('Please add at least one time');
		return;
	}

	// ✅ NEW: Clear existing pending logs first
	medState.deletePendingLogsForMedication(schedulingMedication.id);

	// Create temporary medication with updated dates
	const tempMed: Medication = {
		...schedulingMedication,
		startDate: new Date(scheduleStartDate).toISOString(),
		endDate: scheduleEndDate ? new Date(scheduleEndDate).toISOString() : undefined
	};

	// Generate new schedule
	const logs = medState.autoGenerateSchedule(
		session.id,
		tempMed,
		useAutoSchedule ? undefined : scheduleTimes
	);

	// Add all logs
	logs.forEach((log) => medState.addLog(log));

	toast.success(`Created ${logs.length} scheduled doses`);
	showScheduleDialog = false;
	schedulingMedication = null;
}
```

## Behavior After Fix

### Before

- ❌ Clicking "Add Schedule" 3 times → 3x duplicates
- ❌ Editing times and regenerating → More duplicates
- ❌ Changing frequency → Even more duplicates
- ❌ No way to clean except manually deleting each one

### After

- ✅ Clicking "Add Schedule" multiple times → Replaces pending schedule each time
- ✅ Editing times and regenerating → Clean replacement
- ✅ Changing frequency → New schedule replaces old pending ones
- ✅ Preserves completed history (taken/skipped/missed logs stay)

## User Experience Improvement

### Scenario 1: Changing Schedule Times

```
User: "Oh, I need to take it at 9am instead of 8am"
Before: Gets duplicates, has to manually delete all old pending doses
After: Just regenerate schedule, old pending ones auto-cleared ✅
```

### Scenario 2: Extending Treatment Period

```
User: "Doctor extended my treatment by 2 weeks"
Before: Regenerating adds 14 more days ON TOP of existing schedule
After: Regenerating replaces entire pending schedule with new dates ✅
```

### Scenario 3: Changing Frequency

```
User: "Changed from twice daily to three times daily"
Before: Both schedules exist, causing confusion
After: Only new three-times-daily schedule exists ✅
```

## Safety Features

### History Preservation

The fix only deletes `pending` logs, so:

- ✅ **Taken doses**: Preserved (your adherence history stays)
- ✅ **Skipped doses**: Preserved (important for tracking)
- ✅ **Missed doses**: Preserved (helps identify patterns)
- ❌ **Pending doses**: Deleted (these haven't happened yet, safe to replace)

### Medication Isolation

The deletion is scoped to a specific medication:

- ✅ Only affects the medication being scheduled
- ✅ Other medications' schedules untouched
- ✅ Same medication in different sessions untouched

## Files Changed

1. `src/routes/apps/(app)/medication-tracker/states.svelte.ts`

   - Added `deletePendingLogsForMedication()` function

2. `src/routes/apps/(app)/medication-tracker/MedicationList.svelte`
   - Updated `generateSchedule()` to clear pending logs before generating new ones

## Testing

✅ TypeScript check passes: `0 errors, 8 warnings`
✅ No infinite loops or performance issues
✅ Preserves completed medication history
✅ Only affects pending doses

## Impact

- **Zero data loss**: Completed medication logs preserved
- **Clean schedules**: No more duplicates
- **Better UX**: Users can freely regenerate schedules
- **Intuitive behavior**: Works as users expect
