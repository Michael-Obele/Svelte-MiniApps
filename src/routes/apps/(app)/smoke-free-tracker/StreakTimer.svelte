<script lang="ts">
	import { Clock, TrendingUp } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import type { SmokingAttempt } from './states.svelte';
	import { formatDuration, getDisplayStartDate } from './states.svelte';

	interface Props {
		attempt: SmokingAttempt;
		currentTime: Date;
	}

	let { attempt, currentTime }: Props = $props();

	// Calculate total seconds elapsed since last smoke
	let totalSecondsElapsed = $derived(
		(currentTime.getTime() - new Date(attempt.lastSmokeDate).getTime()) / 1000
	);

	// Calculate streak in minutes (consistent with totalSecondsElapsed)
	let streakMinutes = $derived(Math.floor(totalSecondsElapsed / 60));
	let streakFormatted = $derived(formatDuration(streakMinutes));

	// Calculate time components for large display
	let days = $derived(Math.floor(streakMinutes / 1440));
	let hours = $derived(Math.floor((streakMinutes % 1440) / 60));
	let minutes = $derived(Math.floor(streakMinutes % 60));
	let seconds = $derived(Math.floor(totalSecondsElapsed % 60));
</script>

<Card class="border-primary border-2">
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<span class="flex items-center gap-2">
				<Clock class="size-5" />
				Smoke-Free For
			</span>
			{#if attempt.resetCount > 0}
				<Badge variant="outline">
					<TrendingUp class="mr-1 size-3" />
					Attempt #{attempt.resetCount + 1}
				</Badge>
			{/if}
		</CardTitle>
	</CardHeader>
	<CardContent>
		<!-- Large Timer Display -->
		<div class="mb-6 grid grid-cols-4 gap-4 text-center">
			<div>
				<div class="text-primary text-4xl font-bold lg:text-5xl">{days}</div>
				<div class="text-muted-foreground text-sm">days</div>
			</div>
			<div>
				<div class="text-primary text-4xl font-bold lg:text-5xl">{hours}</div>
				<div class="text-muted-foreground text-sm">hours</div>
			</div>
			<div>
				<div class="text-primary text-4xl font-bold lg:text-5xl">{minutes}</div>
				<div class="text-muted-foreground text-sm">mins</div>
			</div>
			<div>
				<div class="text-primary text-4xl font-bold lg:text-5xl">{seconds}</div>
				<div class="text-muted-foreground text-sm">secs</div>
			</div>
		</div>

		<!-- Additional Info -->
		<div class="flex items-center justify-between border-t pt-4">
			<div>
				<p class="text-muted-foreground text-sm">Started</p>
				<p class="font-medium">
					{new Date(getDisplayStartDate(attempt)).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					})}
				</p>
			</div>
			{#if attempt.longestStreak > 0}
				<div class="text-right">
					<p class="text-muted-foreground text-sm">Longest Streak</p>
					<p class="font-medium">{formatDuration(attempt.longestStreak)}</p>
				</div>
			{/if}
		</div>
	</CardContent>
</Card>
