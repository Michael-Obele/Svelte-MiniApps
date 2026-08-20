<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import * as Chart from '@/ui/chart';
	import { BarChart, PieChart, AreaChart, LineChart, Tooltip } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { format as formatDate, startOfWeek } from 'date-fns';
	import { cubicInOut } from 'svelte/easing';

	let { computed, chartConfig, year } = $props<{
		computed: any;
		chartConfig: any;
		year: string;
	}>();

	// Weekly aggregation for line chart
	const weeklyData = $derived.by(() => {
		const weeks: Record<string, { date: Date; contributions: number; weekLabel: string }> = {};
		computed.calendarData.forEach((d: any) => {
			const weekStart = startOfWeek(new Date(d.date), { weekStartsOn: 1 });
			const key = weekStart.toISOString().split('T')[0];
			if (!weeks[key]) {
				weeks[key] = { date: weekStart, contributions: 0, weekLabel: '' };
			}
			weeks[key].contributions += d.value;
		});
		return Object.values(weeks).sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	// Pie chart data for contribution types
	const pieData = $derived(
		computed.contributionTypes.map((t: any) => ({
			type: t.label,
			count: t.value
		}))
	);

	const pieColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

	// Day-of-week aggregation
	const dayOfWeekData = $derived.by(() => {
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const totals = [0, 0, 0, 0, 0, 0, 0];
		computed.calendarData.forEach((d: any) => {
			const dow = new Date(d.date).getDay();
			totals[dow] += d.value;
		});
		return dayNames.map((name, i) => ({ day: name, contributions: totals[i] }));
	});
</script>

<div class="space-y-6">
	<!-- Monthly Contributions Bar Chart -->
	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Monthly Contributions</CardTitle>
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

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Contribution Type Pie Chart -->
		<Card>
			<CardHeader>
				<CardTitle class="text-lg font-bold">Contribution Types</CardTitle>
				<CardDescription>Breakdown of contribution categories</CardDescription>
			</CardHeader>
			<CardContent>
				{#if pieData.length > 0 && pieData.some((d: any) => d.count > 0)}
					<div class="h-[280px]">
						<PieChart data={pieData} key="type" value="count" cRange={pieColors} innerRadius={-30}>
							{#snippet tooltip()}
								<Tooltip.Root>
									{#snippet children({ data })}
										<Tooltip.Header value={data.type} />
										<Tooltip.List>
											<Tooltip.Item label="Count" value={data.count} format="integer" />
										</Tooltip.List>
									{/snippet}
								</Tooltip.Root>
							{/snippet}
						</PieChart>
					</div>
				{:else}
					<div class="bg-muted flex h-[280px] items-center justify-center rounded-lg">
						<p class="text-muted-foreground text-sm">No contribution data</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Day of Week Activity -->
		<Card>
			<CardHeader>
				<CardTitle class="text-lg font-bold">Activity by Day</CardTitle>
				<CardDescription>Which days you contribute the most</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="h-[280px]">
					<BarChart
						data={dayOfWeekData}
						xScale={scaleBand().padding(0.3)}
						x="day"
						axis="x"
						series={[
							{
								key: 'contributions',
								label: 'Contributions',
								color: 'hsl(var(--chart-2))'
							}
						]}
						props={{
							bars: {
								stroke: 'none',
								rounded: 'all',
								radius: 6
							},
							highlight: { area: { fill: 'none' } }
						}}
					>
						{#snippet tooltip()}
							<Chart.Tooltip hideLabel={false} />
						{/snippet}
					</BarChart>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Daily Contributions Area Chart -->
	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Daily Contributions</CardTitle>
			<CardDescription>Contribution activity trend throughout {year}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="h-[250px]">
				<AreaChart
					data={computed.calendarData.map((d: any) => ({
						date: new Date(d.date),
						contributions: d.value
					}))}
					x="date"
					y="contributions"
					series={[
						{
							key: 'contributions',
							label: 'Contributions',
							color: 'hsl(var(--chart-1))'
						}
					]}
				>
					{#snippet tooltip()}
						<Tooltip.Root>
							{#snippet children({ data })}
								<Tooltip.Header value={data.date} format="day" />
								<Tooltip.List>
									<Tooltip.Item label="Contributions" value={data.contributions} format="integer" />
								</Tooltip.List>
							{/snippet}
						</Tooltip.Root>
					{/snippet}
				</AreaChart>
			</div>
		</CardContent>
	</Card>

	<!-- Weekly Trend Line Chart -->
	{#if weeklyData.length > 0}
		<Card>
			<CardHeader>
				<CardTitle class="text-lg font-bold">Weekly Trend</CardTitle>
				<CardDescription>Contributions aggregated by week</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="h-[250px]">
					<LineChart
						data={weeklyData}
						x="date"
						y="contributions"
						series={[
							{
								key: 'contributions',
								label: 'Contributions',
								color: 'hsl(var(--chart-3))'
							}
						]}
					>
						{#snippet tooltip()}
							<Tooltip.Root>
								{#snippet children({ data })}
									<Tooltip.Header value={data.date} format="day" />
									<Tooltip.List>
										<Tooltip.Item
											label="Weekly Total"
											value={data.contributions}
											format="integer"
										/>
									</Tooltip.List>
								{/snippet}
							</Tooltip.Root>
						{/snippet}
					</LineChart>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Language Breakdown -->
	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Languages Used</CardTitle>
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
							<span class="font-bold">{lang.name}</span>
							<span class="text-muted-foreground text-xs font-medium">
								{lang.count}
								{lang.count === 1 ? 'repo' : 'repos'} ({percentage}%)
							</span>
						</div>
						<div class="bg-secondary h-2.5 w-full overflow-hidden rounded-full">
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
