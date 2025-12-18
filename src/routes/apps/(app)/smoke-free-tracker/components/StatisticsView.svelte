<script lang="ts">
	import { TrendingUp, Award, Heart, Target } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

	interface Props {
		statistics: {
			streakMinutes: number;
			streakFormatted: string;
			longestStreak: string;
			moneySaved: number;
			cigarettesAvoided: number;
			totalCravings: number;
			successfulCravings: number;
			cravingSuccessRate: number;
			achievedMilestones: any[];
			nextMilestone: any;
			resetCount: number;
		};
	}

	let { statistics }: Props = $props();
</script>

<div class="grid gap-4 md:grid-cols-2">
	<!-- Streak Stats -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<TrendingUp class="size-5 text-blue-500" />
				Streak Information
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Current Streak</span>
				<span class="font-semibold">{statistics.streakFormatted}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Longest Streak</span>
				<span class="font-semibold">{statistics.longestStreak}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Reset Count</span>
				<span class="font-semibold">{statistics.resetCount}</span>
			</div>
		</CardContent>
	</Card>

	<!-- Health Progress -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Heart class="size-5 text-pink-500" />
				Health Progress
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Milestones Achieved</span>
				<span class="font-semibold">{statistics.achievedMilestones.length}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Cigarettes Not Smoked</span>
				<span class="font-semibold">{statistics.cigarettesAvoided}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Days Smoke-Free</span>
				<span class="font-semibold">{Math.floor(statistics.streakMinutes / 1440)}</span>
			</div>
		</CardContent>
	</Card>

	<!-- Craving Management -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Target class="size-5 text-orange-500" />
				Craving Management
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Total Cravings</span>
				<span class="font-semibold">{statistics.totalCravings}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Resisted Successfully</span>
				<span class="font-semibold">{statistics.successfulCravings}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Success Rate</span>
				<span class="font-semibold">{statistics.cravingSuccessRate}%</span>
			</div>
		</CardContent>
	</Card>

	<!-- Achievements -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Award class="size-5 text-yellow-500" />
				Achievements
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Milestones Unlocked</span>
				<span class="font-semibold">{statistics.achievedMilestones.length} / 12</span>
			</div>
			{#if statistics.achievedMilestones.length > 0}
				<div class="flex justify-between">
					<span class="text-muted-foreground">Latest Achievement</span>
					<span class="font-semibold">
						{statistics.achievedMilestones[statistics.achievedMilestones.length - 1].name}
					</span>
				</div>
			{/if}
			{#if statistics.nextMilestone}
				<div class="flex justify-between">
					<span class="text-muted-foreground">Next Milestone</span>
					<span class="font-semibold">{statistics.nextMilestone.name}</span>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
