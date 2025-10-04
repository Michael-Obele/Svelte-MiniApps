# Purchase Tracker Data Sync - Test Plan

## Manual Testing Checklist

### Setup

- [ ] Ensure database is set up and running
- [ ] Have at least 2 different browsers or devices ready for testing
- [ ] Clear local storage before starting tests

### Test 1: Automatic Sync on Page Load (Authenticated User)

1. **Device A:**

   - [ ] Login to the app
   - [ ] Navigate to Purchase Tracker
   - [ ] Add 2-3 items
   - [ ] Add some purchase records
   - [ ] Click "Backup" button to save to server
   - [ ] Verify success toast appears

2. **Device B:**
   - [ ] Login with the same account
   - [ ] Navigate to Purchase Tracker
   - [ ] **Expected:** Automatically see the items and purchases from Device A
   - [ ] Check console for sync log messages
   - [ ] Verify data matches Device A

### Test 2: Manual Refresh Button

1. **Device A:**

   - [ ] Add a new item "Test Item X"
   - [ ] Click "Backup" to save to server

2. **Device B (already on Purchase Tracker page):**
   - [ ] Click the "Refresh" button
   - [ ] **Expected:** See spinner and "Refreshing..." text
   - [ ] **Expected:** Success toast with data counts
   - [ ] **Expected:** New item "Test Item X" appears
   - [ ] Verify all data is current

### Test 3: Unsaved Changes Warning

1. **Device A:**
   - [ ] Make local changes (add an item)
   - [ ] Do NOT click Backup
   - [ ] Click "Refresh" button
   - [ ] **Expected:** Confirmation dialog appears
   - [ ] **Expected:** Warning about unsaved changes
   - [ ] Click "Cancel"
   - [ ] **Expected:** Refresh is cancelled, local changes preserved
   - [ ] Click "Refresh" again
   - [ ] Click "OK" to confirm
   - [ ] **Expected:** Local changes are overridden with server data

### Test 4: Unauthenticated User

1. **Without logging in:**
   - [ ] Navigate to Purchase Tracker
   - [ ] Add some local items
   - [ ] **Expected:** No "Refresh" button visible
   - [ ] **Expected:** Only "Backup" button is hidden
   - [ ] Data should persist in local storage

### Test 5: Error Handling

1. **Network Error:**

   - [ ] Disconnect from internet
   - [ ] Click "Refresh" button
   - [ ] **Expected:** Error toast appears
   - [ ] **Expected:** Button returns to normal state
   - [ ] Check console for error log

2. **Authentication Error:**
   - [ ] Clear authentication cookies
   - [ ] Click "Refresh" button
   - [ ] **Expected:** Error toast: "Please log in to refresh data"

### Test 6: Loading States

1. [ ] Click "Refresh" button
2. [ ] **Expected:** Button shows "Refreshing..." with spinner
3. [ ] **Expected:** Button is disabled during refresh
4. [ ] Try clicking button multiple times rapidly
5. [ ] **Expected:** Only one request is made
6. [ ] **Expected:** Button returns to normal after completion

### Test 7: Empty Data Scenarios

1. **New User:**

   - [ ] Login with new account (no data on server)
   - [ ] Navigate to Purchase Tracker
   - [ ] **Expected:** Empty state shown
   - [ ] Add items and backup
   - [ ] Click refresh
   - [ ] **Expected:** Data persists correctly

2. **Clear Server Data:**
   - [ ] Have local data
   - [ ] Manually clear server data via database
   - [ ] Click "Refresh"
   - [ ] **Expected:** Local data is cleared (shows empty state)

### Test 8: Large Dataset

1. [ ] Create 50+ items with multiple purchases each
2. [ ] Click "Backup"
3. [ ] On another device, click "Refresh"
4. [ ] **Expected:** All data loads correctly
5. [ ] **Expected:** No performance issues
6. [ ] Check console for completion messages

### Test 9: Concurrent Operations

1. [ ] Click "Refresh" button
2. [ ] Immediately try to:
   - [ ] Add a new item
   - [ ] Edit an item
   - [ ] Delete an item
3. [ ] **Expected:** Operations complete successfully
4. [ ] **Expected:** No race conditions or data corruption

### Test 10: Console Logging

1. [ ] Open browser console
2. [ ] Perform various operations
3. [ ] Verify appropriate log messages:
   - [ ] "🔄 Syncing data from server: X items, Y purchases"
   - [ ] "🔄 Fetching latest data from server..."
   - [ ] "✅ Successfully refreshed: X items, Y purchases"
   - [ ] Error messages when failures occur

## Expected Behavior Summary

### Automatic Sync

- ✅ Authenticated users always get server data on page load
- ✅ Local storage updates with server data
- ✅ No unsaved changes flag after sync
- ✅ Console logs sync operations

### Manual Refresh

- ✅ Button visible only for authenticated users
- ✅ Shows loading state during operation
- ✅ Warns about unsaved changes
- ✅ Provides success/error feedback
- ✅ Updates local state with fresh server data

### Edge Cases

- ✅ Handles unauthenticated users gracefully
- ✅ Prevents data loss with confirmation dialogs
- ✅ Handles network errors with user feedback
- ✅ Disables button during operation
- ✅ Works with empty datasets

## Performance Metrics

Track these metrics during testing:

- Time to refresh data with 50 items: **\_\_** ms
- Time to refresh data with 100 items: **\_\_** ms
- UI responsiveness during refresh: **\_\_**
- Memory usage before/after: **\_\_**

## Issues Found

Document any issues discovered during testing:

| Test Case | Issue Description | Severity | Status |
| --------- | ----------------- | -------- | ------ |
|           |                   |          |        |

## Sign-off

- [ ] All tests passed
- [ ] No critical issues found
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Code review completed

**Tested by:** ******\_\_\_\_******  
**Date:** ******\_\_\_\_******  
**Build/Version:** ******\_\_\_\_******
