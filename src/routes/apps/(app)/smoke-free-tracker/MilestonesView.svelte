<script lang="ts">
	import { Trophy, Check, Lock } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { Progress } from '@/ui/progress';
	import type { SmokingAttempt } from './states.svelte';
	import { defaultMilestones, getStreakMinutes } from './states.svelte';

	interface Props {
		statistics: {
			streakMinutes: number;
			achievedMilestones: any[];
			nextMilestone: any;
		};
		attempt: SmokingAttempt;
	}

	let { statistics, attempt }: Props = $props();

	let allMilestones = $derived(
		defaultMilestones.map((m) => {
			const achieved = statistics.achievedMilestones.some((am) => am.id === m.id);
			const isNext = statistics.nextMilestone?.id === m.id;
			const progress =
				!achieved && isNext
					? Math.min(100, (statistics.streakMinutes / m.duration) * 100)
					: achieved
						? 100
						: 0;

			return {
				...m,
				achieved,
				isNext,
				progress
			};
		})
	);
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<Trophy class="size-5" />
			Health Milestones
		</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			{#each allMilestones as milestone}
				<div
					class="rounded-lg border p-4 transition-all {milestone.achieved
						? 'border-green-500/50 bg-green-500/5'
						: milestone.isNext
							? 'border-primary bg-primary/5'
							: 'border-border bg-muted/30'}"
				>
					<div class="flex items-start gap-4">
						<!-- Icon -->
						<div class="text-4xl">{milestone.icon}</div>

						<!-- Content -->
						<div class="flex-1">
							<div class="mb-1 flex items-center gap-2">
								<h3 class="font-semibold">{milestone.name}</h3>
								{#if milestone.achieved}
									<Badge variant="outline" class="border-green-500 text-green-500">
										<Check class="mr-1 size-3" />
										Achieved
									</Badge>
								{:else if milestone.isNext}
									<Badge variant="outline" class="border-primary text-primary">In Progress</Badge>
								{:else}
									<Badge variant="outline" class="text-muted-foreground">
										<Lock class="mr-1 size-3" />
										Locked
									</Badge>
								{/if}
							</div>

							<p class="text-sm text-muted-foreground">{milestone.description}</p>

							{#if !milestone.achieved && milestone.isNext}
								<div class="mt-3">
									<Progress value={milestone.progress} class="h-2" />
									<p class="mt-1 text-xs text-muted-foreground">
										{milestone.progress.toFixed(0)}% complete
									</p>
								</div>
							{/if}

							{#if milestone.achieved}
								<p class="mt-2 text-xs text-green-600 dark:text-green-400">
									Achieved {new Date(
										new Date(attempt.lastSmokeDate).getTime() + milestone.duration * 60000
									).toLocaleString()}
								</p>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</CardContent>
</Card>
