# Quick Guide: Reschedule a Single Dose

## How to Reschedule (Step by Step)

### Scenario: Moving Tonight's 8 PM Dose to 9 PM

#### Option 1: From Today's Schedule

```
1. Open Medication Tracker
   └─ View: "Today's Schedule"

2. Find the 8:00 PM dose
   └─ Status: Pending (gray badge with clock icon)

3. Click "Reschedule" button
   └─ Icon: 📅 CalendarClock
   └─ Location: Left of "Taken" button

4. Dialog opens with current time
   ┌─────────────────────────────────┐
   │ Reschedule Medication          │
   ├─────────────────────────────────┤
   │                                │
   │ 💡 This reschedules only this   │
   │    single dose...              │
   │                                │
   │ New Date: [2025-10-05]        │
   │ New Time: [20:00] ← Change to │
   │                   [21:00]      │
   │                                │
   │ [Cancel]  [Reschedule]        │
   └─────────────────────────────────┘

5. Change time from 20:00 to 21:00

6. Click "Reschedule"

7. ✅ Success!
   └─ Toast: "Dose rescheduled successfully"
   └─ Dose now shows at 9:00 PM
```

#### Option 2: From History View

```
1. Open Medication Tracker
   └─ View: "Medication History"

2. Scroll to today's date
   └─ Shows: Today | 2 medications scheduled

3. Find the 8:00 PM dose
   └─ Status: Pending

4. Click "Reschedule" button (same as above)

5. Follow steps 4-7 from Option 1
```

## Common Operations

### Move to Different Day

**Example:** Postpone morning dose to tomorrow

```
Current: Today 9:00 AM → Pending
Goal:    Tomorrow 9:00 AM

Steps:
1. Click "Reschedule" on today's 9 AM dose
2. Change date: [2025-10-05] → [2025-10-06]
3. Keep time: [09:00] (unchanged)
4. Click "Reschedule"

Result:
✅ Dose removed from Today
✅ Dose added to Tomorrow
✅ Tomorrow now has TWO 9 AM doses
```

### Move Earlier in Day

**Example:** Take evening dose at lunch instead

```
Current: Today 6:00 PM → Pending
Goal:    Today 12:00 PM

Steps:
1. Click "Reschedule" on 6 PM dose
2. Keep date: [2025-10-05] (unchanged)
3. Change time: [18:00] → [12:00]
4. Click "Reschedule"

Result:
✅ Dose now scheduled for 12:00 PM today
✅ Can take it immediately
```

### Handle Conflict

**Example:** Try to reschedule to occupied time

```
Current Schedule:
├─ 8:00 PM → Medication A (pending)
└─ 9:00 PM → Medication A (pending) ← Already exists!

Attempt:
1. Reschedule 8 PM dose to 9 PM
2. Click "Reschedule"

Result:
❌ Error: "A dose is already scheduled at this time"
└─ Dialog stays open
└─ Choose different time OR
└─ Delete 9 PM dose first, then reschedule
```

## Visual Reference

### Button Location

```
┌─────────────────────────────────────────────────┐
│ Today's Schedule                               │
├─────────────────────────────────────────────────┤
│                                                │
│ ⏰ 8:00 PM                                     │
│                                                │
│ 🔴 Medication Name                             │
│    500mg dosage                                │
│                                                │
│ [📅 Reschedule] [✓ Taken] [✕ Skip]           │
│    └─ Click here!                              │
│                                                │
└─────────────────────────────────────────────────┘
```

### Status Indicators

```
Pending Dose (Can Reschedule):
┌─────────────────────────────────┐
│ 🔴 Aspirin 500mg               │
│ ⏰ Pending | 8:00 PM           │
│ [📅 Reschedule] [✓] [✕]       │ ← Button visible
└─────────────────────────────────┘

Taken Dose (Cannot Reschedule):
┌─────────────────────────────────┐
│ 🔴 Aspirin 500mg               │
│ ✓ Taken at 8:15 PM             │
│ [🕐 Edit Time] [↺ Undo]        │ ← No reschedule
└─────────────────────────────────┘
```

## Tips & Tricks

### ✅ Do This

- **Reschedule before taking:** Plan adjustments ahead of time
- **Use for one-time changes:** Perfect for special occasions
- **Check for conflicts:** Look at your schedule before rescheduling
- **Reschedule to realistic times:** Consider when you'll actually be able to take it

### ❌ Avoid This

- **Don't reschedule taken doses:** Use "Edit Time" instead
- **Don't reschedule repeatedly:** If you need permanent changes, update the medication schedule
- **Don't create overlaps:** System prevents this, but plan ahead
- **Don't forget about timezone:** Times are based on your current timezone

## Comparison Chart

| What I Want                      | Which Feature  | Button Location                   |
| -------------------------------- | -------------- | --------------------------------- |
| Move this dose to different time | **Reschedule** | Today/History view, pending doses |
| Record when I actually took it   | **Edit Time**  | Today/History view, taken doses   |
| Change all future doses          | **Schedule**   | Medications list                  |
| Mark dose as completed           | **Taken**      | Today/History view, pending doses |

## Keyboard Shortcuts (Future Enhancement)

```
Currently not implemented, but planned:

R - Reschedule selected dose
Esc - Close reschedule dialog
Enter - Confirm reschedule
Tab - Navigate between date/time fields
```

## Troubleshooting

### Problem: Reschedule button not visible

**Possible Causes:**

1. Dose is not "pending" (already taken/skipped/missed)
2. Looking at wrong view (only in Today/History)
3. Browser cache issue

**Solution:**

- Check dose status (should be "Pending")
- Refresh page
- Clear browser cache

### Problem: "Already scheduled at this time" error

**Possible Causes:**

1. Another dose of same medication at that time
2. Trying to reschedule to exact same time (shouldn't error, but does)

**Solution:**

- Choose different time (even 5 minutes difference)
- Delete conflicting dose if not needed
- Check History view for all scheduled doses

### Problem: Reschedule doesn't save

**Possible Causes:**

1. Browser localStorage disabled
2. Page not refreshing after reschedule
3. Multiple tabs open (sync conflict)

**Solution:**

- Enable localStorage in browser settings
- Manually refresh page
- Close other tabs with app open

## Examples

### Example 1: Dinner Plans Tonight

```
Situation:
- Normally take medication at 7:00 PM with dinner
- Tonight have dinner reservations at 8:00 PM
- Want to take medication after dinner at 9:00 PM

Solution:
1. Open Today's Schedule
2. Find 7:00 PM dose
3. Reschedule to 9:00 PM
4. Take medication after returning from dinner
5. Tomorrow's 7:00 PM dose remains unchanged
```

### Example 2: Forgot Morning Dose

```
Situation:
- Supposed to take medication at 8:00 AM
- Now it's 2:00 PM and forgot to take it
- Want to take it now instead of skipping

Solution:
1. Open Today's Schedule
2. Find 8:00 AM dose (shows as "Overdue")
3. Option A: Just mark as "Taken" at current time (2 PM)
4. Option B: Reschedule to 2:00 PM, then mark as "Taken"
5. Both options work, A is simpler
```

### Example 3: Weekend Schedule Change

```
Situation:
- Weekdays take medication at 6:00 AM (wake up early)
- Weekends want to take at 9:00 AM (sleep in)
- It's Saturday morning

Solution:
1. Open Today's Schedule
2. Find 6:00 AM dose
3. Reschedule to 9:00 AM
4. Take when you wake up
5. Remember: Must do this each weekend (or update main schedule)
```

## Related Features

- **Edit Time:** Change `actualTime` after taking dose
- **Schedule:** Bulk reschedule all future doses
- **Skip:** Intentionally not take a dose
- **Mark as Taken:** Record dose completion
- **Undo:** Revert taken/skipped status to pending

---

**Quick Reference Card**

```
┌────────────────────────────────────────┐
│ RESCHEDULE SINGLE DOSE                │
├────────────────────────────────────────┤
│                                        │
│ WHEN:    Before taking the dose       │
│ WHERE:   Today/History view           │
│ WHO:     Pending doses only           │
│ WHAT:    Changes scheduled time       │
│ WHY:     One-time schedule adjustment │
│                                        │
│ STEPS:                                 │
│ 1. Find pending dose                  │
│ 2. Click [📅 Reschedule]              │
│ 3. Change date/time                   │
│ 4. Click [Reschedule]                 │
│                                        │
└────────────────────────────────────────┘
```

**Last Updated:** 2025-10-05
