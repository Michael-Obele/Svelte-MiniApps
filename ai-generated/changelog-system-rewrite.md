# Changelog Generation System - Complete Rewrite

## Overview

The changelog generation system has been completely rewritten with a **JSON-first architecture** and **smart merge algorithm** that ensures zero data loss.

## Architecture

### Data Flow

```
┌─────────────────┐
│  Git Commits    │  596 commits in repo
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Group by Date   │  ← Group commits by date + type
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  generated-data.json         │  ← PRIMARY SOURCE OF TRUTH
│  150 timeline entries        │    (Simple, reliable)
└────────┬─────────────────────┘
         │
         ├──► Read existing entries
         │
         ▼
┌─────────────────┐
│  Smart Merge    │  ← Merge by date, dedupe by commit hash
│  Algorithm      │    NEVER replaces entries
└────────┬────────┘
         │
         ├──► Save JSON (source)
         │
         ▼
┌──────────────────────────────┐
│  generated-data.ts           │  ← GENERATED ARTIFACT
│  (TypeScript + IDE support)  │    (Created from JSON)
└──────────────────────────────┘
```

### Key Principles

1. **JSON is Source of Truth**: All data lives in `generated-data.json`
2. **TypeScript is Generated**: The `.ts` file is created from JSON, not parsed
3. **Smart Merging**: Entries merged by date, deduplicated by commit hash
4. **Zero Data Loss**: Script aborts if entry count decreases

## Implementation

### 1. JSON-First Data Loading

```typescript
function getExistingGeneratedData(): TimelineItem[] {
	const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');

	if (!existsSync(jsonPath)) {
		console.log('📝 No existing JSON data found - starting fresh');
		return [];
	}

	const content = readFileSync(jsonPath, 'utf-8');
	const data = JSON.parse(content);
	return data.timeline as TimelineItem[];
}
```

**Benefits:**

- Simple JSON.parse() - no regex needed
- Reliable and fast
- Easy to debug and validate
- No TypeScript parsing complexity

### 2. Smart Merge Algorithm

The core innovation: **merge entries by date, deduplicate by commit hash**.

```typescript
function mergeTimelineItems(
	newItems: TimelineItem[],
	existingItems: TimelineItem[]
): TimelineItem[] {
	const merged = new Map<string, TimelineItem>();

	// Step 1: Add all existing items to map (keyed by date)
	for (const item of existingItems) {
		merged.set(item.date, { ...item, items: [...item.items] });
	}

	// Step 2: Merge or add new items
	for (const newItem of newItems) {
		const existing = merged.get(newItem.date);

		if (existing) {
			// Same date exists - MERGE commits, don't replace

			// Extract commit hashes from existing items
			const existingHashes = new Set(
				existing.items
					.map((item) => {
						const match = item.match(/\(([a-f0-9]{7})\)$/);
						return match ? match[1] : null;
					})
					.filter(Boolean)
			);

			// Add only NEW commits (by hash)
			const newCommits = newItem.items.filter((item) => {
				const match = item.match(/\(([a-f0-9]{7})\)$/);
				const hash = match ? match[1] : null;
				return hash && !existingHashes.has(hash);
			});

			if (newCommits.length > 0) {
				// Prepend new commits (newest first)
				existing.items = [...newCommits, ...existing.items];

				// Update description
				const totalFiles = new Set(existing.items).size;
				existing.description = `Multiple updates across ${totalFiles} commit${totalFiles === 1 ? '' : 's'}`;

				console.log(`  ✓ Merged ${newCommits.length} new commit(s) into ${newItem.date}`);
			}
		} else {
			// New date entry - just add it
			merged.set(newItem.date, newItem);
			console.log(`  ✓ Added new date entry: ${newItem.date}`);
		}
	}

	// Sort by date (newest first)
	return Array.from(merged.values()).sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
}
```

**How It Works:**

1. Create a map of existing entries (keyed by date)
2. For each new entry:
   - If date exists: **merge** commits (dedupe by hash)
   - If date new: **add** entry
3. Never replace or delete existing data
4. Return sorted by date

### 3. Data Loss Prevention

```typescript
// Strict safety check
if (mergedItems.length < existingData.length) {
	console.error(
		`❌ ERROR: Entry count decreased from ${existingData.length} to ${mergedItems.length}`
	);
	console.error('❌ This indicates data loss! Aborting to prevent data corruption.');
	process.exit(1); // ABORT - don't save
}
```

The script **aborts with error** if entry count decreases, preventing any data loss.

### 4. Write Order

```typescript
// Save JSON FIRST (source of truth)
writeFileSync(
	jsonPath,
	JSON.stringify(
		{
			lastProcessedCommit: latestCommit,
			generatedAt: new Date().toISOString(),
			timeline: mergedItems
		},
		null,
		2
	)
);

// Then generate TypeScript file from JSON
writeFileSync(outputPath, generateDataFile(mergedItems, latestCommit));
```

JSON is always written first, ensuring it's the authoritative source.

## Usage

### Normal Incremental Update

```bash
bun run scripts/generate-changelog.ts
```

**What happens:**

1. Reads `lastProcessedCommit` from JSON
2. Fetches new commits since that hash
3. Groups new commits by date
4. Smart merges with existing JSON data
5. Saves updated JSON + regenerates TS file

**Output example:**

```
🔍 Generating changelog from git commits...
📅 Last processed commit: f692217...
📝 Found 2 commits to process
📊 Generated 1 new changelog entries
📚 Loaded 149 existing entries from JSON
🔄 Merging with existing entries...
  ✓ Added new date entry: October 31, 2025
📋 Total entries after merge: 150
✅ Changelog data written to generated-data.ts
✅ JSON backup saved to generated-data.json
🎉 Changelog generation complete!
```

### Full Rebuild (Safe)

```bash
bun run scripts/generate-changelog.ts --full
```

**What happens:**

1. Reprocesses ALL commits from repository (596 commits)
2. Groups into timeline entries (150 entries)
3. Smart merges with existing JSON data
4. Deduplicates by commit hash
5. **Preserves all existing entries** (won't reduce count)

**Use cases:**

- Fix grouping logic
- Update formatting
- Regenerate descriptions
- Verify data integrity

**Output example:**

```
🔍 Generating changelog from git commits...
🔄 Force full rebuild requested - reprocessing all commits
📝 Found 596 commits to process
📊 Generated 150 new changelog entries
📚 Loaded 150 existing entries from JSON
🔄 Merging with existing entries...
📋 Total entries after merge: 150
✅ Data integrity maintained!
```

### First-Time Setup (Migration)

If you have an existing TypeScript file but no JSON:

```bash
# Step 1: Migrate existing TS data to JSON
bun run scripts/migrate-changelog-to-json.ts

# Step 2: Run normal generation
bun run scripts/generate-changelog.ts
```

**Migration output:**

```
🔄 Migrating changelog data from TS to JSON...
✅ Extracted 149 entries from TS file
✅ Successfully migrated 149 entries to JSON
📁 JSON file: /path/to/generated-data.json
🎉 Migration complete! JSON is now the source of truth.
```

## Benefits

### ✅ Zero Data Loss

- Script aborts if entry count decreases
- Impossible to accidentally delete entries
- All historical data preserved forever

### ✅ Smart Merging

- Combines commits from the same date
- Deduplicates only by commit hash
- Never replaces entire entries
- Prepends new commits (newest first)

### ✅ Simple & Reliable

- JSON is easy to parse and validate
- No complex regex parsing
- TypeScript file is just generated output
- Clear error messages

### ✅ Safe Rebuilds

- `--full` flag is completely safe
- Can reprocess all commits without data loss
- Useful for fixing formatting or grouping

### ✅ Append-Only

- New commits always prepended
- Existing commits never modified
- Date entries accumulate over time
- True historical record

## Files

- `scripts/generate-changelog.ts` - Main generation script (rewritten)
- `scripts/migrate-changelog-to-json.ts` - One-time migration script
- `src/routes/changelog/generated-data.json` - **Primary data source** (150 entries)
- `src/routes/changelog/generated-data.ts` - Generated TypeScript file (for types)

## Testing Results

### Test 1: Normal Incremental Update

```bash
$ bun run scripts/generate-changelog.ts
📝 Found 2 commits to process
📚 Loaded 149 existing entries
📋 Total entries after merge: 150  ✅
```

### Test 2: Full Rebuild (Data Preservation)

```bash
$ bun run scripts/generate-changelog.ts --full
📝 Found 596 commits to process
📚 Loaded 150 existing entries
📋 Total entries after merge: 150  ✅  (No data loss!)
```

### Test 3: Verification

```bash
$ echo "JSON: $(jq '.timeline | length' generated-data.json)"
JSON: 150  ✅

$ echo "TS: $(grep -c '"date":' generated-data.ts)"
TS: 150  ✅
```

## Migration Notes

If you previously had issues with data loss:

1. **Restore your TS file** from git history (if needed)
2. **Run migration**: `bun run scripts/migrate-changelog-to-json.ts`
3. **Verify count**: Check JSON has all entries
4. **Run generation**: Normal updates will now preserve all data

The new system is **backward compatible** - it can read existing TS files and migrate them to JSON safely.

## Conclusion

The new changelog generation system:

- Uses **JSON as the source of truth** (not a "backup")
- Implements **smart merging** (by date, dedupe by hash)
- Provides **zero data loss guarantees** (aborts on decrease)
- Makes **full rebuilds safe** (preserves all existing data)
- Generates **TypeScript artifacts** (for IDE support)

**Result:** A robust, reliable changelog system that never loses data. 🎉
