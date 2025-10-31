# Changelog JSON-First Architecture

## Overview

The changelog system now uses a **JSON-first architecture** where the JSON file is the single source of truth, and the TypeScript file simply imports and re-exports it with proper types.

## Architecture

### File Structure

```
src/routes/changelog/
├── generated-data.json       # Source of truth (managed by script)
├── generated-data.ts          # Type-safe loader (static, rarely changes)
└── data.svelte.ts            # Data aggregation (imports from generated-data.ts)
```

### Data Flow

```
Git Commits
    ↓
generate-changelog.ts (writes to JSON only)
    ↓
generated-data.json (single source of truth)
    ↓
generated-data.ts (imports JSON, re-exports with types)
    ↓
data.svelte.ts (combines manual + generated timeline)
    ↓
Page Components
```

## Benefits

1. **No Sync Issues**: Single source of truth eliminates sync problems
2. **Simpler Script**: Generation script only writes to JSON
3. **Type Safety**: TypeScript types still work through the loader
4. **Efficient**: Vite handles JSON imports efficiently
5. **Static Loader**: The TS file is static and rarely needs changes

## File Responsibilities

### `generated-data.json`

- **Managed by**: `scripts/generate-changelog.ts`
- **Purpose**: Stores complete changelog history
- **Updated**: When new commits are processed
- **Format**:

```json
{
	"lastProcessedCommit": "commit-hash",
	"generatedAt": "ISO-timestamp",
	"timeline": [
		{
			"date": "Month DD, YYYY",
			"title": "Entry title",
			"description": "Entry description",
			"items": ["commit messages"],
			"type": "feature|fix|improvement|breaking|deprecation",
			"icon": "IconName",
			"color": "tailwind-gradient"
		}
	]
}
```

### `generated-data.ts`

- **Managed by**: Manual updates (rare)
- **Purpose**: Import JSON and re-export with TypeScript types
- **Updated**: Only when type definitions change
- **Content**:

```typescript
import changelogData from './generated-data.json';

export interface GeneratedTimelineItem {
	date: string;
	title: string;
	description: string;
	items: string[];
	type: 'breaking' | 'feature' | 'improvement' | 'deprecation' | 'fix';
	icon: string;
	color: string;
}

export const generatedTimeline: GeneratedTimelineItem[] =
	changelogData.timeline as GeneratedTimelineItem[];

export const lastUpdated = changelogData.generatedAt;
export const lastProcessedCommit = changelogData.lastProcessedCommit;
```

### `scripts/generate-changelog.ts`

- **Purpose**: Process git commits and update JSON file
- **Key Functions**:
  - `getLastProcessedCommit()`: Read last commit from JSON
  - `getExistingGeneratedData()`: Load existing timeline from JSON
  - `mergeTimelineItems()`: Smart merge of new + existing commits
  - `generateJsonData()`: Create JSON data structure
  - `main()`: Orchestrate the process

## Script Workflow

### Normal Run

```
1. Read lastProcessedCommit from JSON
2. Get commits since last processed commit
3. If no new commits → exit (no writes needed)
4. If new commits → process them:
   a. Group commits by date and type
   b. Load existing data from JSON
   c. Smart merge (deduplicate by commit hash)
   d. Write merged data back to JSON
```

### Full Rebuild

```bash
bun run scripts/generate-changelog.ts --full
```

- Reprocesses ALL commits
- Merges with existing data (no data loss)
- Updates JSON with complete history

## Key Features

### Smart Merge Algorithm

- Deduplicates commits by hash
- Prepends new commits (newest first)
- Updates descriptions with file counts
- Sorts by date (newest first)

### Data Preservation

- Always loads existing data before merging
- Safety check prevents entry count decrease
- Aborts on potential data loss

### No Manual Intervention

- TS file doesn't need regeneration
- JSON is automatically maintained
- Vite hot reloads on JSON changes

## Usage

### Running the Script

```bash
# Normal incremental update
bun run scripts/generate-changelog.ts

# Full rebuild (reprocess all commits)
bun run scripts/generate-changelog.ts --full
```

### Development

- The script runs automatically in CI/CD
- JSON updates trigger Vite hot reload
- No need to commit the TS file changes

### Debugging

```bash
# Check last processed commit
cat src/routes/changelog/generated-data.json | grep lastProcessedCommit

# Count entries
grep -c '"date":' src/routes/changelog/generated-data.json

# View recent entries
head -50 src/routes/changelog/generated-data.json
```

## Migration from Old System

### Old System (Dual Maintenance)

- ❌ Generated both JSON and TS files
- ❌ TS file contained embedded data
- ❌ Sync issues when files didn't match
- ❌ Complex regeneration logic

### New System (JSON-First)

- ✅ Only writes to JSON
- ✅ TS file imports JSON
- ✅ No sync issues (single source of truth)
- ✅ Simple, maintainable script

## Best Practices

### Do's

- ✅ Let the script manage JSON file
- ✅ Commit JSON changes
- ✅ Run script regularly to stay updated
- ✅ Use `--full` flag if data seems incorrect

### Don'ts

- ❌ Manually edit JSON file
- ❌ Manually edit TS file (unless changing types)
- ❌ Delete JSON file (history will be lost)
- ❌ Run script multiple times in parallel

## Error Handling

### Data Loss Prevention

```typescript
if (mergedItems.length < existingData.length) {
	console.error('❌ ERROR: Entry count decreased');
	console.error('❌ This indicates data loss! Aborting.');
	process.exit(1);
}
```

### Recovery

If JSON file is lost or corrupted:

1. Check git history: `git log --all --full-history -- src/routes/changelog/generated-data.json`
2. Restore from commit: `git checkout <commit-hash> -- src/routes/changelog/generated-data.json`
3. Or rebuild: `bun run scripts/generate-changelog.ts --full`

## Performance

- **Script execution**: ~1-2 seconds
- **JSON parsing**: Negligible (Vite optimized)
- **Bundle impact**: Minimal (JSON tree-shaking)
- **Hot reload**: Instant on JSON changes

## Future Enhancements

Potential improvements:

- [ ] Add filtering by date range
- [ ] Generate statistics from timeline data
- [ ] Support multiple changelog files
- [ ] Add changelog validation tests
- [ ] Generate changelog markdown for releases

---

**Last Updated**: October 31, 2025  
**Architecture Version**: 2.0 (JSON-First)
