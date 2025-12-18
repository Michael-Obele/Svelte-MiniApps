<script lang="ts">
	import type { Option, DashboardStats } from '../types';
	import { formatDate, getSeverityColor } from '../types';
	import { options, risks, getDashboardStats, getStartDate, getEndDate } from '../stores.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '@/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Clock,
		Target,
		Calendar,
		TrendingUp,
		AlertTriangle,
		PieChart as PieIcon
	} from 'lucide-svelte';

	let stats = $derived(getDashboardStats());
	let startDate = $derived(getStartDate());
	let endDate = $derived(getEndDate());

	// Calculate progress through planning period
	let progressThroughPeriod = $derived.by(() => {
		const now = new Date();
		const totalDuration = endDate.getTime() - startDate.getTime();
		const elapsed = now.getTime() - startDate.getTime();
		const progress = (elapsed / totalDuration) * 100;
		return Math.max(0, Math.min(100, progress));
	});

	// Chart data for allocation
	let allocationData = $derived(
		options.current.map((opt) => ({
			name: opt.name,
			value: opt.allocation,
			color: opt.color.replace('bg-', '').replace('-500', '')
		}))
	);

	// Get total allocation
	let totalAllocation = $derived(options.current.reduce((sum, opt) => sum + opt.allocation, 0));

	// Color map for charts
	const colorMap: Record<string, string> = {
		blue: '#3b82f6',
		amber: '#f59e0b',
		purple: '#a855f7',
		green: '#22c55e',
		red: '#ef4444',
		slate: '#64748b'
	};

	function getChartColor(colorClass: string): string {
		const colorName = colorClass.replace('bg-', '').replace('-500', '');
		return colorMap[colorName] || '#64748b';
	}

	// High severity risks count
	let highRisksCount = $derived(
		risks.current.filter((r) => r.severity === 'high' || r.severity === 'critical').length
	);
</script>

<div class="space-y-6">
	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Time Remaining</Card.Title>
				<Calendar class="text-muted-foreground size-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.remainingYears} years</div>
				<p class="text-muted-foreground text-xs">
					{stats.remainingDays.toLocaleString()} days left
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Time Invested</Card.Title>
				<Clock class="text-muted-foreground size-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.totalTimeSpent} hrs</div>
				<p class="text-muted-foreground text-xs">Across all options</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Average Progress</Card.Title>
				<TrendingUp class="text-muted-foreground size-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.averageProgress}%</div>
				<Progress
					value={stats.averageProgress}
					class="mt-2 h-2"
					classInner="bg-green-500 transition-all"
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Risks</Card.Title>
				<AlertTriangle class="text-muted-foreground size-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{risks.current.length}</div>
				<p class="text-muted-foreground text-xs">
					{highRisksCount} high/critical severity
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Options Summary Grid -->
	<div class="grid gap-4 lg:grid-cols-2">
		<!-- Options Cards -->
		<Card.Root class="col-span-1">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Target class="size-5" />
					Options Overview
				</Card.Title>
				<Card.Description>Track progress across your scenario options</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each options.current as option (option.id)}
					<div class="space-y-2 rounded-lg border p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="{option.color} size-3 rounded-full"></div>
								<span class="font-medium">{option.name}</span>
							</div>
							<Badge variant="outline">{option.allocation}%</Badge>
						</div>
						<p class="text-muted-foreground text-sm">{option.description}</p>
						<div class="flex items-center justify-between text-sm">
							<span>{option.totalTimeSpent} hrs invested</span>
							<span>{option.progress}% complete</span>
						</div>
						<Progress
							value={option.progress}
							class="h-2"
							classInner="{option.color.replace('bg-', 'bg-')} transition-all"
						/>
						<p class="text-muted-foreground text-xs">
							Est. completion: {option.estimatedTimeToCompletion}
						</p>
					</div>
				{/each}

				{#if options.current.length === 0}
					<p class="text-muted-foreground py-8 text-center">
						No options yet. Add your first scenario option to get started.
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Allocation Chart -->
		<Card.Root class="col-span-1">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<PieIcon class="size-5" />
					Time Allocation
				</Card.Title>
				<Card.Description>How you're dividing your effort</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if options.current.length > 0}
					<div class="flex flex-col items-center gap-4">
						<!-- Simple allocation visualization using bars -->
						<div class="flex h-8 w-full overflow-hidden rounded-lg">
							{#each options.current as option (option.id)}
								<div
									class="{option.color} flex items-center justify-center text-xs font-medium text-white"
									style="width: {(option.allocation / Math.max(totalAllocation, 100)) * 100}%"
								>
									{#if option.allocation >= 15}
										{option.allocation}%
									{/if}
								</div>
							{/each}
						</div>

						<!-- Legend -->
						<div class="grid w-full gap-2">
							{#each options.current as option (option.id)}
								<div class="flex items-center justify-between text-sm">
									<div class="flex items-center gap-2">
										<div class="{option.color} size-3 rounded-full"></div>
										<span>{option.name}</span>
									</div>
									<span class="font-medium">{option.allocation}%</span>
								</div>
							{/each}
						</div>

						{#if totalAllocation !== 100}
							<p class="text-muted-foreground text-xs">
								Total: {totalAllocation}%
								{#if totalAllocation < 100}
									({100 - totalAllocation}% unallocated)
								{:else if totalAllocation > 100}
									(over-allocated by {totalAllocation - 100}%)
								{/if}
							</p>
						{/if}
					</div>
				{:else}
					<p class="text-muted-foreground py-8 text-center">Add options to see allocation chart</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Timeline Preview -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Deadline</Card.Title>
			<Card.Description
				>Your planning window ends on {formatDate(endDate.toISOString())}</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span>Progress through planning period</span>
					<span>{progressThroughPeriod.toFixed(1)}%</span>
				</div>
				<Progress
					value={progressThroughPeriod}
					class="h-3"
					classInner="bg-gradient-to-r from-green-500 via-amber-500 to-red-500 transition-all"
				/>
				<div class="text-muted-foreground flex justify-between text-xs">
					<span>Started: {formatDate(startDate.toISOString())}</span>
					<span>Deadline: {formatDate(endDate.toISOString())}</span>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
