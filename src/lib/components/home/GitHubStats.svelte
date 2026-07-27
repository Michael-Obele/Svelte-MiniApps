<!--
@component

GitHubStats — proof-of-life signal for developer audiences.

Instead of weak vanity metrics (small star/fork counts), this shows a
commit-activity sparkline + "last updated" indicator. The sparkline
proves active maintenance visually.

Research basis (2026, 2,000-page A/B study): aggregate stats below 1,000
hurt conversion. But a verifiable "proof of life" signal (sparkline +
recency badge) builds trust without anchoring to weak numbers.
-->

<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { AreaChart, Tooltip } from 'layerchart';
	import { GitCommit, Activity } from '@lucide/svelte';

	interface Props {
		github: {
			lastCommitDate: string | null;
			weeklyActivity: Array<{ total: number; week: number }>;
		} | null;
	}

	let { github }: Props = $props();

	// Use actual week timestamps from the API to build accurate monthly buckets
	let chartData = $derived.by(() => {
		if (!github?.weeklyActivity) return [];
		const weeks = github.weeklyActivity;
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		const now = new Date();
		const currentMonth = now.getMonth();

		// Build 12 empty monthly buckets (from 12 months ago to current)
		const buckets: { label: string; commits: number }[] = [];
		for (let m = 0; m < 12; m++) {
			const monthIdx = (currentMonth - 11 + m + 12) % 12;
			buckets.push({ label: monthNames[monthIdx], commits: 0 });
		}

		// Assign each week to a month bucket using the actual week timestamp
		for (const w of weeks) {
			if (w.total === 0) continue;
			// week is Unix timestamp (seconds), convert to ms
			const dateMonth = new Date(w.week * 1000).getMonth();
			for (let b = 0; b < buckets.length; b++) {
				const bucketMonth = (currentMonth - 11 + b + 12) % 12;
				if (bucketMonth === dateMonth) {
					buckets[b].commits += w.total;
					break;
				}
			}
		}

		return buckets;
	});

	let lastUpdatedLabel = $derived.by(() => {
		if (!github?.lastCommitDate) return 'Recently updated';
		const last = new Date(github.lastCommitDate).getTime();
		const now = Date.now();
		const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));

		if (days === 0) return 'Updated today';
		if (days === 1) return 'Updated yesterday';
		if (days < 7) return `Updated ${days} days ago`;
		if (days < 14) return 'Updated last week';
		if (days < 30) return `Updated ${Math.floor(days / 7)} weeks ago`;
		return 'Updated this month';
	});

	let hasActivity = $derived(github?.weeklyActivity?.some((w) => w.total > 0) ?? false);

	let totalCommits = $derived(chartData.reduce((a, b) => a + b.commits, 0));
</script>

<section id="github-stats" class="bg-background w-full py-12 md:py-16 lg:py-20">
	<div class="container mx-auto px-4 md:px-6">
		<div
			class="bg-card text-card-foreground border-border/60 mx-auto max-w-3xl rounded-2xl border p-6 shadow-sm md:p-8"
		>
			<!-- Sparkline: 12 months of commit activity -->
			<div class="mb-6">
				{#if hasActivity && chartData.length > 0}
					<div class="h-[140px] w-full sm:h-[180px]">
						<AreaChart data={chartData} x="label" y="commits">
							{#snippet tooltip()}
								<Tooltip.Root>
									{#snippet children({ data })}
										<div class="bg-background rounded-md border px-2.5 py-1.5 text-xs shadow-md">
											<p class="text-foreground font-semibold">{data.label}</p>
											<p class="text-muted-foreground">
												{data.commits} commit{data.commits !== 1 ? 's' : ''}
											</p>
										</div>
									{/snippet}
								</Tooltip.Root>
							{/snippet}
						</AreaChart>
					</div>
					<div class="text-muted-foreground mt-1 text-center text-xs">
						{totalCommits} commits across the last 12 months
					</div>
				{:else}
					<div
						class="text-muted-foreground flex h-[140px] w-full items-center justify-center rounded-lg border border-dashed sm:h-[180px]"
					>
						<div class="flex flex-col items-center gap-2">
							<Activity class="h-8 w-8 opacity-30" />
							<span class="text-sm">Commit data loading&hellip;</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Copy: maintenance signal below the sparkline -->
			<div class="flex flex-col items-center gap-3 text-center">
				<Badge
					variant="secondary"
					class="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
				>
					<GitCommit class="mr-1.5 h-3.5 w-3.5" />
					{lastUpdatedLabel}
				</Badge>
				<p class="text-muted-foreground max-w-md text-sm leading-relaxed">
					One developer, shipping often. Every line of code is public &mdash; audit it, fork it, or
					open an issue.
				</p>
				<a
					href="https://github.com/Michael-Obele/Svelte-MiniApps"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary text-sm font-medium hover:underline"
				>
					View the source on GitHub &rarr;
				</a>
			</div>
		</div>
	</div>
</section>
