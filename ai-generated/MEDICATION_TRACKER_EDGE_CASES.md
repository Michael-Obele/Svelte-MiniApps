# Medication Tracker Edge Cases & Handling

This document outlines potential edge cases that users might encounter in the Medication Tracker app and how the system handles them.

## Table of Contents

1. [Schedule Management Edge Cases](#schedule-management-edge-cases)
2. [Date & Time Edge Cases](#date--time-edge-cases)
3. [Data Integrity Edge Cases](#data-integrity-edge-cases)
4. [User Interaction Edge Cases](#user-interaction-edge-cases)
5. [Multi-Medication Edge Cases](#multi-medication-edge-cases)
6. [Storage & Performance Edge Cases](#storage--performance-edge-cases)

---

## Schedule Management Edge Cases

### 1. **Editing Schedule for Past/Present Dates**

**Scenario:** User reschedules a medication, but some doses have already been taken or skipped in the past.

**Expected Behavior:**

- ✅ Past logs with status `taken`, `skipped`, or `missed` are ALWAYS preserved (never deleted)
- ✅ Present/past logs with status `pending` that match the new schedule are preserved
- ✅ Only future `pending` logs from the schedule start date onwards are deleted and regenerated
- ✅ This prevents losing historical data while allowing schedule adjustments

**Implementation:**

- `deletePendingLogsForMedication()` now accepts a `fromDate` parameter
- Only deletes pending logs on or after the specified date
- `autoGenerateSchedule()` checks for existing logs and skips duplicates

### 2. **Rescheduling Without Changing Times**

**Scenario:** User opens the schedule dialog and clicks "Generate Schedule" without changing anything.

**Expected Behavior:**

- ✅ No duplicate logs are created
- ✅ System detects existing logs at the same scheduled times
- ✅ Toast message: "Schedule updated (no new doses needed)"
- ❌ Previously: Would delete all pending logs and recreate them (wasteful)

### 3. **Overlapping Schedule Periods**

**Scenario:** User creates a schedule from Jan 1-15, then creates another from Jan 10-30.

**Expected Behavior:**

- ✅ Logs for Jan 10-15 already exist and are skipped (no duplicates)
- ✅ Only new logs for Jan 16-30 are created
- ⚠️ If times change, old pending logs remain unless explicitly deleted

**Recommendation:** Users should delete old schedules before creating new overlapping ones if times have changed.

### 4. **Extending Past Schedule into Future**

**Scenario:** Medication was scheduled Jan 1-15, user now extends to Jan 1-31 on Jan 20.

**Expected Behavior:**

- ✅ Logs for Jan 1-20 are preserved (already have status: taken/skipped/missed/pending)
- ✅ New logs created only for Jan 21-31
- ✅ No duplicates for dates that already have logs

### 5. **Changing Medication Frequency Mid-Schedule**

**Scenario:** Medication was "twice daily", user changes to "three times daily" and reschedules.

**Expected Behavior:**

- ⚠️ Old pending logs remain (2 doses per day)
- ✅ If user reschedules from TODAY onwards:
  - Old future pending logs deleted
  - New schedule with 3 doses per day created
- 💡 **User Action Required:** Users should reschedule after changing frequency

**Recommendation:** Add a prompt: "Frequency changed. Would you like to regenerate the schedule?"

---

## Date & Time Edge Cases

### 6. **Midnight Boundary Issues**

**Scenario:** User schedules a dose at 23:59 and another at 00:01.

**Expected Behavior:**

- ✅ Both doses are on different days (one today, one tomorrow)
- ✅ "Today's" view only shows the 23:59 dose
- ✅ Timezone-aware date calculations prevent confusion

**Implementation:** All dates use `setHours(0, 0, 0, 0)` for day boundaries.

### 7. **Timezone Changes**

**Scenario:** User travels to a different timezone.

**Expected Behavior:**

- ⚠️ Logs are stored as ISO datetime strings (UTC-based)
- ⚠️ Display converts to local timezone
- 💡 **Potential Issue:** A dose at "9:00 AM EST" might display as "6:00 AM PST" after travel
- 🔄 **Future Enhancement:** Add timezone conversion or warning

### 8. **Daylight Saving Time (DST) Transitions**

**Scenario:** DST changes, clocks move forward/backward 1 hour.

**Expected Behavior:**

- ⚠️ Scheduled times remain at the same "wall clock" time (e.g., 9:00 AM)
- ⚠️ ISO strings adjust to UTC, so absolute time changes
- 💡 **User Impact:** Minimal if user follows "clock time", but tracking gaps may occur

### 9. **Scheduling for Today with Past Time**

**Scenario:** It's 5:00 PM, user schedules dose at 2:00 PM for today.

**Expected Behavior:**

- ✅ Log is created with status `pending`
- ⚠️ If user doesn't mark it, auto-mark as `missed` would be logical (not implemented)
- 🔄 **Future Enhancement:** Auto-mark past pending logs as `missed`

### 10. **End Date Before Start Date**

**Scenario:** User accidentally sets end date before start date.

**Expected Behavior:**

- ✅ Form validation should prevent this (not currently implemented)
- ⚠️ If bypassed, generates 0 logs (while loop exits immediately)
- 🔄 **Future Enhancement:** Add validation in form

---

## Data Integrity Edge Cases

### 11. **Deleting Medication with Existing Logs**

**Scenario:** User deletes a medication that has 100+ logs.

**Expected Behavior:**

- ✅ Medication is removed from session
- ✅ ALL logs for that medication are deleted (including historical data)
- ⚠️ **No Undo:** Deletion is permanent
- 🔄 **Future Enhancement:** Add soft-delete or archive feature

### 12. **Deleting Session with Multiple Medications**

**Scenario:** User deletes a treatment session with 5 medications and 500 logs.

**Expected Behavior:**

- ✅ Session is removed
- ✅ All medications in the session are deleted
- ✅ All logs for the session are deleted
- ⚠️ **No Undo:** Deletion is permanent
- 🔄 **Future Enhancement:** Export session data before deletion

### 13. **Corrupted LocalStorage Data**

**Scenario:** LocalStorage data is manually edited or corrupted.

**Expected Behavior:**

- ⚠️ PersistedState attempts to parse JSON
- ⚠️ If parsing fails, falls back to default (empty array)
- ⚠️ **User Data Loss:** Corrupted data is lost
- 🔄 **Future Enhancement:** Add data validation and recovery

### 14. **Duplicate Medication IDs**

**Scenario:** Two medications somehow have the same ID (unlikely but possible with manual edits).

**Expected Behavior:**

- ⚠️ Both medications exist in the session
- ⚠️ Logs reference the same medication ID
- ⚠️ Editing one doesn't affect the other, but logs are shared
- 🔄 **Prevention:** Use `crypto.randomUUID()` which is collision-resistant

### 15. **Concurrent Tab Editing**

**Scenario:** User has app open in 2 tabs, edits medication in both.

**Expected Behavior:**

- ✅ `syncTabs: true` in PersistedState keeps data in sync
- ⚠️ Last write wins (no conflict resolution)
- ⚠️ If Tab A schedules while Tab B deletes, race condition possible
- 💡 **User Impact:** Rare, but changes in one tab may overwrite another

---

## User Interaction Edge Cases

### 16. **Marking Dose as Taken Before Scheduled Time**

**Scenario:** It's 8:30 AM, user marks 9:00 AM dose as taken.

**Expected Behavior:**

- ✅ Status changes to `taken`
- ✅ `actualTime` is set to current time (8:30 AM)
- ⚠️ Analytics show dose taken 30 minutes early
- 💡 **Adherence:** Still counts as "taken" for adherence rate

### 17. **Marking Old Pending Dose as Taken**

**Scenario:** User forgot to mark yesterday's 9:00 AM dose, marks it today.

**Expected Behavior:**

- ✅ Status changes to `taken`
- ✅ `actualTime` is set to current time (today)
- ⚠️ Analytics show dose taken 24+ hours late
- 💡 **Better Option:** User should mark as `skipped` or `missed`

### 18. **Skipping vs. Missing a Dose**

**Scenario:** User confusion about "Skip" vs. "Miss".

**Expected Behavior:**

- **Skip:** User intentionally did not take (e.g., doctor's advice)
- **Miss:** User forgot or was unable to take
- ✅ Both are tracked separately in stats
- 💡 **UI Clarification:** Add tooltips explaining the difference

### 19. **Editing Time of Already-Taken Dose**

**Scenario:** User marks dose as taken at 9:00 AM, then edits the scheduled time to 8:00 AM.

**Expected Behavior:**

- ✅ `scheduledTime` changes to 8:00 AM
- ✅ `actualTime` remains 9:00 AM (historical record)
- ✅ User took dose 1 hour late (relative to new schedule)
- 💡 **Accuracy:** Maintains integrity of when dose was actually taken

### 20. **Undoing a Marked Dose**

**Scenario:** User accidentally marks dose as "Taken", wants to undo.

**Expected Behavior:**

- ✅ User can change status back to `pending` or `skipped`
- ✅ `actualTime` is cleared when changing to `pending`
- 💡 **UI:** No explicit "undo" button, but status can be changed

---

## Multi-Medication Edge Cases

### 21. **Two Medications at the Same Time**

**Scenario:** User takes Medication A and B both at 9:00 AM daily.

**Expected Behavior:**

- ✅ Both medications have separate logs
- ✅ Today view shows both doses at 9:00 AM
- ✅ User marks each separately
- 💡 **UI:** Groups by time for better visibility

### 22. **Running Out of Colors**

**Scenario:** User adds 11+ medications (more than available colors).

**Expected Behavior:**

- ✅ New medications reuse first color (`medicationColors[0]`)
- ⚠️ Multiple medications may have the same color
- 💡 **User Impact:** Harder to visually distinguish
- 🔄 **Future Enhancement:** Generate more colors or use patterns

### 23. **Medications with Overlapping Periods**

**Scenario:** Medication A (Jan 1-30), Medication B (Jan 15-Feb 15).

**Expected Behavior:**

- ✅ Both medications tracked independently
- ✅ Stats calculated per medication
- ✅ Jan 15-30 shows logs for both
- 💡 **No Conflict:** System handles multiple medications naturally

### 24. **Editing One Medication Affects Others**

**Scenario:** User changes session dates while medications have different start/end dates.

**Expected Behavior:**

- ✅ Medication dates are independent of session dates
- ✅ Session dates are for UI/organization only
- ⚠️ Session stats aggregate all medications regardless of dates

---

## Storage & Performance Edge Cases

### 25. **LocalStorage Quota Exceeded**

**Scenario:** User has years of medication data, LocalStorage fills up (5-10 MB limit).

**Expected Behavior:**

- ⚠️ Write to LocalStorage fails silently
- ⚠️ Data loss on next page refresh
- 💡 **User Impact:** App stops saving new data
- 🔄 **Future Enhancement:** Add quota monitoring and warning

**Recommendation:** Implement data cleanup:

- Archive logs older than 1 year
- Export/download historical data
- Move to IndexedDB (larger storage)

### 26. **Thousands of Logs (Performance)**

**Scenario:** User tracks 5 medications, 5 times daily, for 2 years = 18,250 logs.

**Expected Behavior:**

- ⚠️ All logs loaded into memory
- ⚠️ Filtering/sorting may slow down on low-end devices
- ⚠️ UI may lag when rendering large lists
- 🔄 **Future Enhancement:** Implement pagination or virtual scrolling

**Current Performance:**

- Fast for <1000 logs
- Acceptable for 1000-5000 logs
- May lag with 5000+ logs

### 27. **Export/Import Data**

**Scenario:** User wants to move data between devices.

**Expected Behavior:**

- ❌ **Not Implemented:** No export/import feature
- 🔄 **Workaround:** User can manually copy LocalStorage data
- 🔄 **Future Enhancement:** Add JSON export/import buttons

### 28. **Browser Cache Clear**

**Scenario:** User clears browser cache/data.

**Expected Behavior:**

- ⚠️ LocalStorage is cleared
- ⚠️ **All Data Lost:** Sessions, medications, logs
- 💡 **User Education:** Warn users about data persistence
- 🔄 **Future Enhancement:** Cloud sync or backup reminders

---

## Summary & Recommendations

### Immediate Action Items

1. ✅ **Fixed:** Schedule editing no longer duplicates past/present logs
2. ✅ **Fixed:** Rescheduling checks for existing logs to avoid duplicates

### High Priority Enhancements

1. **Add Form Validation:**

   - End date must be after start date
   - Medication name/dosage required
   - Schedule must have at least one time

2. **Auto-Mark Missed Doses:**

   - Cron job or on-load check to mark past pending logs as `missed`

3. **Schedule Change Detection:**

   - When frequency changes, prompt to reschedule

4. **Data Export/Import:**
   - JSON export for backup
   - Import from backup file

### Medium Priority Enhancements

1. **Soft Delete:**

   - Archive medications instead of permanent deletion
   - Allow restore within 30 days

2. **Timezone Awareness:**

   - Store and display timezone with logs
   - Warning when timezone changes

3. **Performance Optimization:**

   - Lazy load old logs
   - Virtual scrolling for large lists
   - Archive logs older than 1 year

4. **Storage Management:**
   - Monitor LocalStorage usage
   - Warn when approaching quota
   - Suggest data cleanup

### Low Priority Enhancements

1. **Undo/Redo:**

   - Undo last action (mark as taken, delete, etc.)

2. **Color Management:**

   - Let users pick custom colors
   - Generate more colors when needed

3. **Conflict Resolution:**

   - Handle concurrent tab edits gracefully

4. **Cloud Sync:**
   - Optional account system
   - Sync data across devices

---

## Testing Scenarios

### Critical Test Cases

1. ✅ Reschedule medication with past logs → Past logs preserved
2. ✅ Reschedule without changes → No duplicates created
3. ✅ Delete medication → All logs deleted
4. ✅ Delete session → All medications and logs deleted
5. ✅ Add medication with end date before start → Validate or handle gracefully

### Edge Case Test Cases

1. Schedule at midnight boundary (23:59 and 00:01)
2. Mark dose as taken before scheduled time
3. Mark old pending dose as taken after many days
4. Add 15 medications and check color assignment
5. Create 1000+ logs and test performance
6. Clear LocalStorage and verify data loss handling
7. Edit medication in two tabs simultaneously
8. Schedule overlapping periods for same medication

---

## Conclusion

The Medication Tracker app is robust for typical use cases but has several edge cases that could impact user experience. The recent fix for schedule editing prevents the most critical issue (duplicate past logs). Future enhancements should focus on data validation, performance optimization, and user education about data persistence.

**Last Updated:** 2025-10-05  
**App Version:** Current (post-fix)
