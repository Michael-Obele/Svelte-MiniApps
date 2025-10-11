<script lang="ts">
	import { Calendar, TrendingUp, RotateCcw, Trophy, Clock } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import {
		smokingAttempts,
		formatDuration,
		getAttemptDuration,
		getOverallLongestStreak
	} from './states.svelte';

	let allAttempts = $derived(smokingAttempts.current.slice().reverse());
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<Calendar class="size-5" />
			Attempt History
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if allAttempts.length === 0}
			<div class="text-muted-foreground py-12 text-center">
				<Calendar class="mx-auto mb-4 size-12 opacity-50" />
				<p>No attempts yet. Start your journey above!</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each allAttempts as attempt, index (attempt.id)}
					<div
						class="rounded-lg border p-4 {attempt.isActive
							? 'border-primary bg-primary/5'
							: 'border-border'}"
					>
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<h3 class="font-semibold">
									Attempt #{attempt.resetCount + 1}
								</h3>
								{#if attempt.isActive}
									<Badge variant="default">Current</Badge>
								{:else}
									<Badge variant="outline">Completed</Badge>
								{/if}
							</div>
							<div class="text-muted-foreground text-sm">
								{new Date(attempt.startDate).toLocaleDateString()}
							</div>
						</div>

						<div class="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
							<div>
								<div class="text-muted-foreground mb-1 flex items-center gap-2">
									<TrendingUp class="size-4" />
									Longest Streak
								</div>
								<div class="font-semibold">{formatDuration(getOverallLongestStreak())}</div>
							</div>

							<div>
								<div class="text-muted-foreground mb-1 flex items-center gap-2">
									<RotateCcw class="size-4" />
									Resets
								</div>
								<div class="font-semibold">{attempt.resetCount}</div>
							</div>

							<div>
								<div class="text-muted-foreground mb-1 flex items-center gap-2">
									<Clock class="size-4" />
									Total Duration
								</div>
								<div class="font-semibold">
									{#if attempt.isActive}
										Ongoing
									{:else}
										{formatDuration(getAttemptDuration(attempt))}
									{/if}
								</div>
							</div>

							<div>
								<div class="text-muted-foreground mb-1 flex items-center gap-2">
									<Trophy class="size-4" />
									Status
								</div>
								<div class="font-semibold">
									{#if attempt.isActive}
										In Progress
									{:else}
										Completed
									{/if}
								</div>
							</div>
						</div>

						{#if !attempt.isActive && attempt.endDate}
							<div class="text-muted-foreground mt-3 border-t pt-3 text-xs">
								Ended: {new Date(attempt.endDate).toLocaleDateString()}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
