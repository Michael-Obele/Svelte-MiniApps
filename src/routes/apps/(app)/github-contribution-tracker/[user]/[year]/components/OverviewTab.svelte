<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import * as Chart from '@/ui/chart';
	import { BarChart } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { format as formatDate } from 'date-fns';
	import { cubicInOut } from 'svelte/easing';

	let { computed, chartConfig, year } = $props<{
		computed: any;
		chartConfig: any;
		year: string;
	}>();
</script>

<div class="space-y-6">
	<!-- Monthly Contributions Chart -->
	<Card>
		<CardHeader>
			<CardTitle>Monthly Contributions</CardTitle>
			<CardDescription>Total contributions per month in {year}</CardDescription>
		</CardHeader>
		<CardContent class="px-2 pt-4 sm:px-6 sm:pt-6">
			<div class="w-full overflow-x-auto">
				<Chart.Container config={chartConfig} class="h-[300px] min-w-[300px] sm:h-[400px]">
					<BarChart
						data={computed.monthlyData}
						xScale={scaleBand().padding(0.4)}
						x="month"
						axis="x"
						series={[
							{
								key: 'contributions',
								label: 'Contributions',
								color: chartConfig.contributions.color
							}
						]}
						props={{
							bars: {
								stroke: 'none',
								rounded: 'all',
								radius: 8,
								motion: {
									x: { type: 'tween', duration: 500, easing: cubicInOut },
									width: { type: 'tween', duration: 500, easing: cubicInOut },
									height: { type: 'tween', duration: 500, easing: cubicInOut },
									y: { type: 'tween', duration: 500, easing: cubicInOut }
								}
							},
							highlight: { area: { fill: 'none' } }
						}}
					>
						{#snippet tooltip()}
							<Chart.Tooltip
								labelFormatter={(month: string) => {
									const monthData = computed.monthlyData.find((d: any) => d.month === month);
									return monthData ? formatDate(monthData.date, 'MMMM yyyy') : month;
								}}
								hideLabel={false}
							/>
						{/snippet}
					</BarChart>
				</Chart.Container>
			</div>
		</CardContent>
	</Card>

	<!-- Language Breakdown -->
	<Card>
		<CardHeader>
			<CardTitle>Languages Used</CardTitle>
			<CardDescription>Top programming languages in contributed repositories</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-3">
				{#each computed.languageBreakdown as lang, i (lang.name)}
					{@const totalRepos = computed.languageBreakdown.reduce(
						(sum: number, l: any) => sum + l.count,
						0
					)}
					{@const percentage = ((lang.count / totalRepos) * 100).toFixed(1)}
					{@const colors = [
						'bg-blue-500',
						'bg-purple-500',
						'bg-green-500',
						'bg-yellow-500',
						'bg-red-500',
						'bg-pink-500',
						'bg-indigo-500',
						'bg-teal-500'
					]}
					<div class="space-y-1">
						<div class="flex items-center justify-between text-sm">
							<span class="font-medium">{lang.name}</span>
							<span class="text-muted-foreground">
								{lang.count}
								{lang.count === 1 ? 'repo' : 'repos'} ({percentage}%)
							</span>
						</div>
						<div class="bg-secondary h-2 w-full overflow-hidden rounded-full">
							<div
								class="{colors[i % colors.length]} h-full transition-all duration-300"
								style="width: {percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
