# Single Dose Reschedule Feature

## Overview

The Medication Tracker now supports rescheduling individual doses without affecting the entire medication schedule. This allows users to move a specific dose from one time/date to another (e.g., from 8:00 PM to 9:00 PM) while keeping all other doses unchanged.

## Feature Implementation

### Core Function: `rescheduleLog()`

**Location:** `src/routes/apps/(app)/medication-tracker/states.svelte.ts`

```typescript
export function rescheduleLog(
	logId: string,
	newScheduledTime: string
): { success: boolean; message: string; conflictingLog?: MedicationLog };
```

**Purpose:** Update the `scheduledTime` of a single medication log while checking for conflicts.

**Parameters:**

- `logId`: The unique ID of the log to reschedule
- `newScheduledTime`: The new scheduled time as an ISO datetime string

**Returns:**

- `success`: Boolean indicating if the reschedule was successful
- `message`: User-friendly message describing the result
- `conflictingLog`: (Optional) The conflicting log if one exists

**Behavior:**

1. Finds the log to reschedule
2. Checks if another dose of the same medication is already scheduled at the new time
3. If conflict exists, returns error with conflicting log details
4. If no conflict, updates the `scheduledTime` and returns success

### UI Components

#### 1. HistoryView Component

**Features Added:**

- **Reschedule Button:** Appears next to pending doses in the history view
- **Reschedule Dialog:** Allows selecting new date and time
- **Conflict Detection:** Shows error toast if time is already occupied

**User Flow:**

1. User views medication history
2. Clicks "Reschedule" button on a pending dose
3. Dialog opens with current scheduled date/time pre-filled
4. User selects new date and time
5. Clicks "Reschedule"
6. System checks for conflicts and updates or shows error

**Location:** `src/routes/apps/(app)/medication-tracker/HistoryView.svelte`

#### 2. TodayTracker Component

**Features Added:**

- **Reschedule Button:** Appears for pending doses in today's schedule
- **Reschedule Dialog:** Same functionality as HistoryView
- **Visual Feedback:** Toast notifications for success/error

**User Flow:**

1. User views today's scheduled doses
2. Clicks "Reschedule" button on a pending dose
3. Dialog opens with current date/time
4. User modifies date/time
5. System validates and updates

**Location:** `src/routes/apps/(app)/medication-tracker/TodayTracker.svelte`

## Use Cases

### Use Case 1: Single Time Adjustment

**Scenario:** User normally takes medication at 8:00 PM, but has dinner plans tonight and wants to take it at 6:00 PM instead.

**Steps:**

1. Open Today's Schedule or History
2. Find the 8:00 PM dose
3. Click "Reschedule"
4. Change time to 6:00 PM
5. Click "Reschedule" button
6. Dose is now scheduled for 6:00 PM today only

**Result:** Tomorrow's 8:00 PM dose remains unchanged. Only today's dose is moved.

### Use Case 2: Postpone to Tomorrow

**Scenario:** User forgot to take morning dose at 9:00 AM and wants to take it tomorrow instead.

**Steps:**

1. Open Today's Schedule
2. Find the 9:00 AM dose (now overdue)
3. Click "Reschedule"
4. Change date to tomorrow
5. Keep time at 9:00 AM
6. Click "Reschedule"

**Result:** Dose is moved to tomorrow 9:00 AM. Tomorrow will now have two 9:00 AM doses (the postponed one + the regular one).

### Use Case 3: Conflict Detection

**Scenario:** User tries to reschedule 8:00 PM dose to 9:00 PM, but already has a 9:00 PM dose scheduled.

**Steps:**

1. Click "Reschedule" on 8:00 PM dose
2. Change time to 9:00 PM
3. Click "Reschedule"

**Result:** Error toast appears: "A dose is already scheduled at this time". Dose remains at 8:00 PM.

## Important Distinctions

### Reschedule vs. Edit Time

| Feature             | Reschedule                                     | Edit Time                                   |
| ------------------- | ---------------------------------------------- | ------------------------------------------- |
| **What it changes** | `scheduledTime` (when dose should be taken)    | `actualTime` (when dose was actually taken) |
| **When to use**     | Before taking the dose                         | After marking as "Taken"                    |
| **Use case**        | "I want to take this dose at a different time" | "I took it at 8:15 PM instead of 8:00 PM"   |
| **Status change**   | None (remains "pending")                       | None (remains "taken")                      |
| **Affects**         | Only this single dose                          | Only this single dose                       |

### Reschedule (Single) vs. Schedule (Bulk)

| Feature      | Reschedule Single Dose         | Schedule Medication                                        |
| ------------ | ------------------------------ | ---------------------------------------------------------- |
| **Scope**    | One specific dose              | All future doses                                           |
| **Location** | Today/History view             | Medication List                                            |
| **Use case** | One-time adjustment            | Change entire schedule                                     |
| **Example**  | Move today's 8 PM dose to 9 PM | Change all doses from "twice daily" to "three times daily" |

## Edge Cases & Handling

### 1. **Conflict Detection**

**Scenario:** Rescheduling to a time that already has a dose.

**Handling:**

- System checks for existing log at the new time
- Shows error: "A dose is already scheduled at this time"
- Reschedule is blocked, original time preserved
- User must choose a different time or delete conflicting dose

### 2. **Rescheduling Past Doses**

**Scenario:** User reschedules a dose that was supposed to be taken yesterday.

**Handling:**

- ✅ Allowed - User might want to postpone an old pending dose
- No warnings (user has full control)
- Status remains "pending"
- Can reschedule to future or further past

### 3. **Rescheduling Taken/Skipped Doses**

**Scenario:** User tries to reschedule a dose already marked as "taken" or "skipped".

**Handling:**

- ❌ **Not possible** - Reschedule button only appears for "pending" doses
- Once taken/skipped, use "Edit Time" instead (changes `actualTime`, not `scheduledTime`)
- Rationale: Rescheduling a taken dose doesn't make sense (it's already taken)

### 4. **Rescheduling to Same Time**

**Scenario:** User opens reschedule dialog and clicks save without changing anything.

**Handling:**

- ✅ Allowed - No conflict with itself (same log ID)
- Success message: "Dose rescheduled successfully"
- No actual change in data
- Harmless operation

### 5. **Rescheduling After Taking**

**Scenario:** User reschedules a dose to 6:00 PM, then decides to take it immediately and marks as "Taken" at 2:00 PM.

**Handling:**

- ✅ Works perfectly
- `scheduledTime` = 6:00 PM (when it was planned)
- `actualTime` = 2:00 PM (when actually taken)
- `status` = "taken"
- Analytics show dose taken 4 hours early

### 6. **Multiple Reschedules**

**Scenario:** User reschedules a dose multiple times (8 PM → 9 PM → 7 PM → 8:30 PM).

**Handling:**

- ✅ Each reschedule overwrites the previous `scheduledTime`
- No history of reschedules (only current scheduled time is stored)
- Last reschedule wins
- No undo (unless manually reschedule back)

### 7. **Rescheduling Across Days**

**Scenario:** User reschedules today's 11:00 PM dose to tomorrow 1:00 AM.

**Handling:**

- ✅ Works correctly
- Dose moves to tomorrow in the UI
- Today's schedule shows one less dose
- Tomorrow's schedule shows one extra dose
- Useful for late-night doses

### 8. **Bulk Reschedule Simulation**

**Scenario:** User wants to reschedule all future doses (e.g., all 8 PM doses to 9 PM).

**Handling:**

- ❌ **Not supported** with single dose reschedule
- Must reschedule each dose individually
- **Alternative:** Use "Schedule" button in Medications list to regenerate entire schedule
- **Future Enhancement:** Add bulk reschedule feature

## Data Model Impact

### Before Reschedule

```typescript
{
  id: "log-123",
  medicationId: "med-456",
  sessionId: "session-789",
  scheduledTime: "2025-10-05T20:00:00.000Z", // 8:00 PM
  status: "pending",
  actualTime: undefined,
  notes: undefined
}
```

### After Reschedule (to 9:00 PM)

```typescript
{
  id: "log-123",
  medicationId: "med-456",
  sessionId: "session-789",
  scheduledTime: "2025-10-05T21:00:00.000Z", // 9:00 PM ← Changed
  status: "pending", // ← Unchanged
  actualTime: undefined, // ← Unchanged
  notes: undefined
}
```

**Key Points:**

- Only `scheduledTime` changes
- `status` remains "pending"
- `actualTime` remains undefined (until marked as taken)
- All other fields unchanged

## User Experience

### Visual Indicators

**Reschedule Button:**

- **Icon:** 📅 CalendarClock
- **Label:** "Reschedule" (hidden on mobile)
- **Color:** Ghost variant (subtle)
- **Position:** Before "Taken" and "Skip" buttons

**Dialog:**

- **Title:** "Reschedule Medication"
- **Description:** Clear explanation of what reschedule does
- **Info Box:** Blue box explaining difference between single dose and bulk schedule
- **Fields:** Date picker + Time picker
- **Pre-filled:** Current scheduled date/time

### Success/Error Messages

**Success:**

- Toast: "Dose rescheduled successfully" (green checkmark)
- Dialog closes automatically
- UI refreshes to show new time

**Error:**

- Toast: "A dose is already scheduled at this time" (red X)
- Dialog remains open (user can try different time)
- Original time unchanged

### Mobile Responsiveness

- Reschedule button shows icon only on mobile
- Dialog adapts to mobile screen size
- Date/time pickers use native mobile widgets
- Touch-friendly button sizes

## Testing Scenarios

### Functional Tests

1. **Basic Reschedule:**

   - Reschedule pending dose to new time
   - Verify `scheduledTime` updated
   - Verify status remains "pending"

2. **Conflict Detection:**

   - Create two doses at different times
   - Try to reschedule one to the other's time
   - Verify error message

3. **Cross-Day Reschedule:**

   - Reschedule dose from today to tomorrow
   - Verify appears in tomorrow's schedule
   - Verify removed from today's schedule

4. **Same-Time Reschedule:**
   - Reschedule without changing time
   - Verify success message
   - Verify no data corruption

### Edge Case Tests

5. **Reschedule Then Take:**

   - Reschedule dose to 9 PM
   - Mark as taken at 8:30 PM
   - Verify `scheduledTime` = 9 PM, `actualTime` = 8:30 PM

6. **Multiple Reschedules:**

   - Reschedule same dose 3 times
   - Verify only last reschedule persists
   - Verify no duplicate logs created

7. **Cancel Dialog:**
   - Open reschedule dialog
   - Change time
   - Click Cancel
   - Verify original time unchanged

## Best Practices

### For Users

1. **Use Reschedule for one-time changes:** If you need to adjust just today's dose, use Reschedule
2. **Use Schedule for permanent changes:** If you want to change all future doses, use the Schedule button in Medications list
3. **Check for conflicts:** If reschedule fails, verify you don't already have a dose at that time
4. **Consider Edit Time:** If you've already taken the dose, use "Edit Time" instead of reschedule

### For Developers

1. **Always check conflicts:** Never allow rescheduling to an occupied time slot
2. **Preserve status:** Reschedule should never change `status` or `actualTime`
3. **Update UI reactively:** Use Svelte's reactivity to update UI after reschedule
4. **Show clear messages:** User should understand what went wrong if reschedule fails

## Future Enhancements

### Planned Features

1. **Bulk Reschedule:**

   - Select multiple doses
   - Reschedule all at once
   - Useful for recurring adjustments

2. **Reschedule History:**

   - Track all reschedule operations
   - Show "Originally scheduled for X" note
   - Allow viewing reschedule audit log

3. **Smart Conflict Resolution:**

   - Suggest alternative times if conflict exists
   - "Dose already exists at 9 PM. Try 9:15 PM or 9:30 PM?"
   - One-click resolution

4. **Reschedule Patterns:**

   - "Always move 8 PM dose to 9 PM on Fridays"
   - Save and apply reschedule rules
   - Recurring adjustments

5. **Undo Last Reschedule:**
   - Implement undo stack
   - "Undo reschedule" button
   - Restore previous scheduled time

### Technical Improvements

1. **Optimistic Updates:**

   - Update UI immediately
   - Rollback if server/storage fails
   - Better perceived performance

2. **Batch Operations:**

   - Queue multiple reschedules
   - Execute as transaction
   - All succeed or all fail

3. **Conflict Preview:**
   - Show conflicting dose details before attempting reschedule
   - "You already have [Med Name] at 9 PM. Replace or cancel?"
   - Better user awareness

## Conclusion

The single dose reschedule feature provides users with fine-grained control over their medication schedule. It's designed for one-time adjustments while keeping the bulk schedule management separate and intuitive.

**Key Takeaways:**

- ✅ Reschedule changes `scheduledTime` only
- ✅ Only works on "pending" doses
- ✅ Checks for conflicts automatically
- ✅ Available in both Today and History views
- ✅ Separate from bulk schedule management
- ✅ Non-destructive (can reschedule again if needed)

---

**Feature Added:** 2025-10-05  
**Documentation Version:** 1.0  
**Status:** ✅ Implemented & Tested
