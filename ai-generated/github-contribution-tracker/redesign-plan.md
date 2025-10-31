# GitHub Contribution Tracker Redesign Plan

_Date: 2025-10-31_

## Vision

Build a richer, more conversational contribution insights experience that surfaces meaningful GitHub activity signals, powered by remote functions for secure API access and modern Svelte 5 runes-based UI patterns.

## Architectural Direction

- **Remote Functions Everywhere**: Enable `kit.experimental.remoteFunctions` and `compilerOptions.experimental.async` to access GitHub securely server-side, expose typed `query`/`command` interfaces, and support client `await` usage with caching and refresh controls.
- **GraphQL First**: Replace the inline fetch with a dedicated GraphQL client module that handles OAuth token scope (`repo`, `read:user`), pagination, and rate-limit feedback. Prioritize `contributionsCollection` plus supporting objects (repositories, languages, contributionCalendar).
- **Data Processing Layer**: Introduce utilities that normalize GitHub responses into dashboard-friendly domain models (daily timeline, contribution categories, streak metadata, repo summaries). Support derived metrics (rolling averages, busiest days, language mix).
- **Layered State Strategy**: Keep remote function responses as the single source of truth. Use `$state()` for local UI state, `$derived()` for computed aggregates, and `query.refresh()` for on-demand updates.

## Data Model Enhancements

| Area | Detail |
| --- | --- |
| Daily Contributions | Pull `calendarWeeks.days` for contribution counts, colors, and detail URLs. Calculate weekday/hour heatmaps and best/worst streaks. |
| Contribution Types | Fetch commit, issue, PR, review contributions; aggregate totals per month and per repository. |
| Repository Insights | Capture `repositoriesContributedTo` edges with language breakdowns, star/fork counts, open PRs. |
| Highlights | Surface `status`, `sponsorsListing`, and notable achievements (e.g., merged PR streaks, largest repo). |
| Activity Trends | Compute rolling 7/30 day averages, month-over-month changes, milestone dates. |

## UX & UI Strategy

- **Entry Flow**: Redesign landing to feel like a guided wizard—username/year inputs, remembered history, suggested years, and contextual tips.
- **Dashboard Layout**: Organize insights into tabs or stacked sections (Overview, Repositories, Activity Timeline, Highlights, Conversation). Provide responsive, card-based layout with mobile-first considerations.
- **Charts & Visuals**:
  - LayerChart `Calendar` for desktop heatmap; ensure accessible labels and color legends.
  - LayerChart bar/line combos for monthly contributions segmented by type.
  - Sparklines for streak progress, doughnuts for language distribution, timeline markers for milestones.
  - Maintain a lightweight fallback (GitGraph) for smaller viewports.
- **Chat/Insights Panel**: Introduce optional conversational pane that summarizes recent trends, suggests repositories to revisit, or compares periods using precomputed summaries.
- **Storytelling Touches**: Add microcopy for achievements ("Most productive Tuesday"), highlight cards, and call-to-action buttons (view repo, open PR list).

## Remote Function Blueprint

1. **Module Structure**: Create `src/routes/apps/(app)/github-contribution-tracker/data.remote.ts` exporting:
   - `getContributionSummary = query(argsSchema, async (input) => ...)` for primary dataset.
   - `refreshStreaks = command(argsSchema, async (input) => ...)` for manual refresh or extended stats.
   - Potential `query.batch` helpers for per-repository detail fetches.
2. **Schema Validation**: Use Valibot to validate username/year (sanity, allowed ranges) and optional filters (e.g., includePrivate when token scope allows).
3. **Caching Strategy**: Implement in-memory caching keyed by user/year with TTL respecting GitHub rate limits; expose `refresh` to bypass.
4. **Error Handling**: Map GitHub GraphQL errors, rate limits, and missing users to structured responses with user-friendly messages.
5. **Testing**: Add Vitest coverage with mocked GraphQL responses to verify data transformations and schema validation.

## Implementation Roadmap

1. **Enable Remote Functions**
   - Update `svelte.config.js` experimental flags; scaffold remote module and supporting GraphQL client.
2. **Design New Data Layer**
   - Define TypeScript interfaces, conversion utilities, and caching strategy.
   - Draft enhanced GraphQL query documents (fragments for contributions, repos, languages).
3. **Revamp UI**
   - Prototype new layout structure and navigation (tabs/cards).
   - Integrate LayerChart components with prepared data, ensuring accessible tooltips/legends.
   - Build chat/insights panel with summarization helper.
4. **Polish & QA**
   - Add loading, empty, and error states.
   - Implement local storage persistence for recent lookups and preferences.
   - Run `bun check`, targeted Vitest suites, and manual UX review across devices.

## Open Questions

- Should private contributions be supported via user-provided token, and if so how do we handle secure storage and messaging?
- Do we need offline caching (e.g., IndexedDB) for recent views, or is live fetch acceptable?
- How far should the conversation panel go—static summaries or interactive prompts powered by external AI services?

---
Prepared for internal review before implementation begins.