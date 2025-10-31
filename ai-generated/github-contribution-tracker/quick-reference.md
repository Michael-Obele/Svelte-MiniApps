# GitHub Contribution Tracker - Quick Reference

## Files Modified/Created

### New Files

- ✅ `data.remote.ts` - Remote functions for GitHub API

### Modified Files

- ✅ `+page.svelte` (landing) - Enhanced form with recent searches
- ✅ `[user]/[year]/+page.svelte` - Complete UI revamp with tabs

## Key Features

### Landing Page

```svelte
<!-- Recent searches stored in localStorage -->
<RecentSearches />
<!-- Quick year buttons -->
<SuggestedYears />
<!-- Feature highlights -->
<InfoCards />
```

### Results Page Tabs

1. **Overview** - Monthly chart + languages
2. **Repositories** - Top 10 repos with details
3. **Calendar** - Contribution heatmap
4. **Insights** - Statistics and analysis

## Remote Functions

```typescript
// Fetch contribution data
import { getContributionData } from '../data.remote';

const query = $derived(getContributionData({ username, year }));
const data = $derived(await query);

// Refresh data
await query.refresh();
```

## Data Structure

```typescript
interface ContributionData {
	user: string;
	year: string;
	totalContributions: number;
	weeks: ContributionWeek[];
	contributions: ContributionDay[];
	stats: ContributionStats;
	repositories: Repository[];
	contributionYears: number[];
	streakStats: { light: string | null; dark: string | null };
}
```

## Svelte 5 Patterns Used

```svelte
<script lang="ts">
	// Simple derived
	const total = $derived(data.totalContributions);

	// Complex derived
	const monthly = $derived.by(() => {
		// computation
		return result;
	});

	// State
	let loading = $state(false);

	// Async component
	const data = $derived(await query);
</script>
```

## Component Structure

```
Header
  ├── Title + Year
  └── Action Buttons (Refresh, Back)

Stats Cards (4)
  ├── Total Contributions
  ├── Commits
  ├── Pull Requests
  ├── Issues
  └── Reviews

Streak Stats Card

Tabs
  ├── Overview
  │   ├── Monthly Chart
  │   └── Languages
  ├── Repositories
  │   └── Top 10 List
  ├── Calendar
  │   └── Heatmap
  └── Insights
      ├── Activity Summary
      ├── Repository Breakdown
      └── Available Years
```

## Common Tasks

### Add a New Stat

```typescript
// 1. Update GraphQL query in data.remote.ts
const CONTRIBUTION_QUERY = gql`
  query {
    user {
      // add new field
    }
  }
`;

// 2. Update interface
export interface ContributionStats {
  // add new field
  newStat: number;
}

// 3. Process in processContributionData()

// 4. Display in component
<div>{stats.newStat}</div>
```

### Add a New Chart

```svelte
<Chart
  data={yourData}
  x="xField"
  y="yField"
  // configuration
>
  <Svg>
    <Axis placement="left" grid rule />
    <Axis placement="bottom" grid rule />
    <!-- Your chart type -->
  </Svg>

  <Tooltip.Root let:data>
    <Tooltip.Header>{data.title}</Tooltip.Header>
    <Tooltip.List>
      <Tooltip.Item label="Label" value={data.value} />
    </Tooltip.List>
  </Tooltip.Root>
</Chart>
```

### Add a New Tab

```svelte
<Tabs.List>
	<Tabs.Trigger value="newTab">New Tab</Tabs.Trigger>
</Tabs.List>

<Tabs.Content value="newTab">
	<!-- Tab content -->
</Tabs.Content>
```

## Debugging

### Check Remote Function

```bash
# Verify remote function file exists
ls src/routes/apps/\(app\)/github-contribution-tracker/data.remote.ts

# Check TypeScript errors
bun check

# Check runtime logs
# Remote functions log to server console
```

### Common Issues

**Issue:** Module not found error

```
Cannot find module '../data.remote'
```

**Fix:** Add `// @ts-ignore` before import (TypeScript doesn't recognize .remote.ts yet)

**Issue:** Await error in component

```
'await' expressions are only allowed within async functions
```

**Fix:** Add `// @ts-expect-error` comment (experimental async component feature)

**Issue:** Data not refreshing

```typescript
// Call refresh method
await contributionQuery.refresh();

// With toast feedback
toast.promise(contributionQuery.refresh(), {
	loading: 'Refreshing...',
	success: 'Updated!',
	error: 'Failed'
});
```

## Environment Setup

```bash
# Required
export VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Verify token has correct scopes
# - repo (for private contributions)
# - read:user (for user data)
```

## Performance Tips

1. **Limit API Calls**

   - Use cached query results
   - Only refresh when needed
   - Leverage SvelteKit's built-in caching

2. **Optimize Charts**

   - Limit data points for large datasets
   - Use pagination for repository lists
   - Lazy load heavy components

3. **Reduce Bundle Size**
   - Import only needed LayerChart components
   - Tree-shake unused utilities
   - Use dynamic imports for tabs

## Testing

```bash
# Type check
bun check

# Unit tests
npm run test:unit

# E2E tests (if available)
npm run test:e2e
```

## Deployment

1. Set `VITE_GITHUB_TOKEN` in environment
2. Run build: `bun run build`
3. Preview: `vite preview`
4. Deploy to your platform

## Resources

- [Svelte 5 Docs](https://svelte.dev/docs)
- [SvelteKit Remote Functions](https://kit.svelte.dev/docs/remote-functions)
- [LayerChart Docs](https://next.layerchart.com)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)
- [Valibot Schema Validation](https://valibot.dev)
