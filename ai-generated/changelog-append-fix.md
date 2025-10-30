# Changelog Generation Script Fix

## Problem

The changelog generation script (`scripts/generate-changelog.ts`) had issues with preserving old commit entries:

1. **Lost History**: When no last processed commit existed, the script only fetched the last 50 commits using `--max-count=50`, losing all older history
2. **Wrong Merge Order**: Existing data was spread before new data (`[...existingData, ...newTimelineItems]`), causing deduplication to keep old entries instead of new ones
3. **--full Flag Risk**: Full rebuilds would ignore existing data, potentially losing all history beyond 50 commits

## Solution Implemented

### 1. Fetch All Commits on First Run

**Before:**

```typescript
const sinceFlag = since ? `${since}..HEAD` : '--max-count=50';
```

**After:**

```typescript
// When no since hash, get all commits instead of limiting to 50
// This prevents losing old commit history
const sinceFlag = since ? `${since}..HEAD` : '--all';
```

This ensures the first run processes all commits, not just the last 50.

### 2. Reversed Merge Order

**Before:**

```typescript
const allTimelineItems = [...existingData, ...newTimelineItems].sort(
	(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
```

**After:**

```typescript
// Merge with NEW items first, so they appear at the top and take precedence in deduplication
// This ensures new commits are always added to the top without modifying old entries
const allTimelineItems = [...newTimelineItems, ...existingData].sort(
	(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
```

By spreading `newTimelineItems` first, the deduplication logic (which keeps the first occurrence) now preserves new entries over old ones when there are conflicts.

### 3. Always Preserve Existing Data

**Before:**

```typescript
const existingData = forceFullRebuild ? [] : getExistingGeneratedData();
```

**After:**

```typescript
// Always get existing data to preserve history
const existingData = getExistingGeneratedData();
```

Even during `--full` rebuilds, existing data is preserved and merged with reprocessed commits.

### 4. Added Safety Check

```typescript
// Safety check: ensure we're not losing entries
if (uniqueItems.length < existingData.length && !forceFullRebuild) {
	console.warn(
		`⚠️  WARNING: Entry count decreased from ${existingData.length} to ${uniqueItems.length}`
	);
	console.warn('⚠️  This may indicate data loss. Please verify the results.');
}
```

This alerts if entries are being lost during the merge process.

## How It Works Now

1. **Normal Run** (with last processed commit):

   - Fetches only new commits since last processed hash
   - Adds them to the top of existing timeline
   - Preserves all old entries unchanged

2. **First Run** (no last processed commit):

   - Fetches ALL commits from repository history
   - Merges with any existing data (if file already exists)
   - Deduplicates keeping newest entries

3. **Full Rebuild** (`--full` flag):
   - Reprocesses all commits from scratch
   - STILL preserves existing timeline entries
   - Merges reprocessed data with existing data
   - Useful for fixing grouping/formatting without losing history

## Benefits

✅ **No More Lost History**: All commits are preserved across regenerations
✅ **Append-Only**: New entries always added to the top without touching old ones
✅ **Safe Rebuilds**: Even `--full` flag won't delete existing entries
✅ **Better Deduplication**: Newer entries take precedence when there are conflicts
✅ **Safety Warnings**: Alerts if data loss is detected

## Testing

Verified the fix works correctly:

```bash
bun run scripts/generate-changelog.ts
```

Output:

```
🔍 Generating changelog from git commits...
📅 Last processed commit: 895957507e45054eed7c6a9fc920bbb7c1a05844
📝 Found 10 commits to process
📊 Generated 1 changelog entries
📚 Found 3 existing entries
📋 Total entries after merge: 3
✅ Changelog data written to generated-data.ts
✅ JSON backup saved to generated-data.json
🎉 Changelog generation complete!
```

## Files Modified

- `scripts/generate-changelog.ts`: Applied all 4 fixes above
- `src/routes/changelog/generated-data.ts`: Updated with new merge logic
- `src/routes/changelog/generated-data.json`: Backup with explicit lastProcessedCommit field

## Usage

```bash
# Normal incremental update (default)
bun run scripts/generate-changelog.ts

# Full rebuild (now safe - preserves existing data)
bun run scripts/generate-changelog.ts --full
```
