<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import { mockContributionData } from '$lib/test-data/github-contribution-mock';
	import { scaleLinear, scaleBand } from 'd3-scale';
	import { max } from 'd3-array';
	import { format as formatDate } from 'date-fns';

	// shadcn-svelte chart imports
	import { ChartContainer, ChartTooltip, type ChartConfig } from '@/ui/chart';
	import { BarChart, AreaChart, LineChart, PieChart } from 'layerchart';
	import TestComp from './TestComp.svelte';

	// Use static mock data
	const monthlyData = mockContributionData.monthlyData;
	const calendarData = mockContributionData.calendarData;
	const stats = mockContributionData.stats;
	const contributionTypes = mockContributionData.contributionTypes;

	// shadcn-svelte chart config
	const chartConfig = {
		contributions: {
			label: 'Contributions',
			color: 'green'
		},
		desktop: {
			label: 'Desktop',
			color: 'blue'
		},
		mobile: {
			label: 'Mobile',
			color: 'var(--color-pullRequests)'
		}
	} satisfies ChartConfig;

	// Transform data for LayerChart (it expects different format)
	const chartData = monthlyData.map((item) => ({
		month: formatDate(item.date, 'MMM'), // Format date to month abbreviation
		contributions: item.contributionCount
	}));

	// Pie chart data - contribution types
	const pieChartData = contributionTypes.map((type, i) => ({
		name: type.label,
		value: type.value,
		color: `hsl(var(--chart-${i + 1}))`
	}));

	// Pie chart config
	const pieChartConfig = {
		commits: {
			label: 'Commits',
			color: 'hsl(var(--chart-1))'
		},
		pullRequests: {
			label: 'Pull Requests',
			color: 'hsl(var(--chart-2))'
		},
		issues: {
			label: 'Issues',
			color: 'hsl(var(--chart-3))'
		},
		codeReviews: {
			label: 'Code Reviews',
			color: 'hsl(var(--chart-4))'
		}
	} satisfies ChartConfig;

	// Reactive dimensions for charts
	let chartWidth = $state(800);
	let chartHeight = $state(400);
	const padding = { top: 40, right: 40, bottom: 60, left: 60 };

	// Derived values for bar chart
	let innerWidth = $derived(chartWidth - (padding.left + padding.right));
	let innerHeight = $derived(chartHeight - (padding.top + padding.bottom));
	let barWidth = $derived(innerWidth / monthlyData.length);

	// D3 scales using $derived
	let xScale = $derived(
		scaleBand()
			.domain(monthlyData.map((d, i) => i.toString()))
			.range([padding.left, chartWidth - padding.right])
			.padding(0.2)
	);

	let yScale = $derived(
		scaleLinear()
			.domain([0, max(monthlyData, (d) => d.contributionCount) || 0])
			.range([chartHeight - padding.bottom, padding.top])
	);

	// Y-axis ticks
	const yTicks = $derived(yScale.ticks(5));

	console.log('[Test Charts] ========== MOCK DATA LOADED (D3.js) ==========');
	console.log('[Test Charts] Monthly data length:', monthlyData.length);
	console.log('[Test Charts] Calendar data length:', calendarData.length);
	console.log('[Test Charts] First monthly data:', monthlyData[0]);
	console.log('[Test Charts] ========== END MOCK DATA ==========');
</script>

<div class="container mx-auto max-w-6xl space-y-8 p-4">
	<!-- Header -->
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">D3.js Charts Test Page</h1>
		<p class="text-muted-foreground text-lg">
			Testing pure D3.js charts with Svelte 5 (experimental.async enabled)
		</p>
		<div
			class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950"
		>
			<p class="text-sm">
				Using raw D3.js with Svelte 5 runes. Data from <code
					class="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900"
					>src/lib/test-data/github-contribution-mock.ts</code
				>
			</p>
		</div>
	</div>

	<!-- Stats Summary -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardContent class="p-6">
				<p class="text-muted-foreground text-sm font-medium">Total Contributions</p>
				<p class="text-3xl font-bold">{mockContributionData.totalContributions}</p>
			</CardContent>
		</Card>

		{#each contributionTypes as type (type.label)}
			<Card>
				<CardContent class="p-6">
					<p class="text-muted-foreground text-sm font-medium">{type.label}</p>
					<p class="text-3xl font-bold">{type.value}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Test 1: Raw Data Display -->
	<Card>
		<CardHeader>
			<CardTitle>Test 1: Raw Monthly Data (Text)</CardTitle>
			<CardDescription>Displaying {monthlyData.length} months of contribution data</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-2">
				{#each monthlyData as data, i (i)}
					<div class="flex items-center justify-between border-b pb-2">
						<span class="font-mono text-sm">{formatDate(data.date, 'MMM yyyy')}</span>
						<span class="font-bold">{data.contributionCount} contributions</span>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Test 2: D3.js Bar Chart -->
	<Card>
		<CardHeader>
			<CardTitle>Test 2: Monthly Contributions Bar Chart (D3.js)</CardTitle>
			<CardDescription>Pure D3.js bar chart with Svelte 5 runes</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="w-full" bind:clientWidth={chartWidth}>
				<svg width={chartWidth} height={chartHeight}>
					<!-- Y-axis grid lines and labels -->
					<g class="axis y-axis">
						{#each yTicks as tick (tick)}
							<g transform="translate(0, {yScale(tick)})">
								<line
									x1={padding.left}
									x2={chartWidth - padding.right}
									stroke="#e5e7eb"
									stroke-dasharray="2,2"
								/>
								<text x={padding.left - 10} y="4" text-anchor="end" class="fill-gray-600 text-xs">
									{tick}
								</text>
							</g>
						{/each}
					</g>

					<!-- Bars -->
					<g class="bars">
						{#each monthlyData as data, i (i)}
							{@const barX = xScale(i.toString()) || 0}
							{@const barBandwidth = xScale.bandwidth()}
							<rect
								x={barX}
								y={yScale(data.contributionCount)}
								width={barBandwidth}
								height={chartHeight - padding.bottom - yScale(data.contributionCount)}
								fill="#0e4429"
								class="transition-colors hover:fill-green-600"
							/>
							<text
								x={barX + barBandwidth / 2}
								y={chartHeight - padding.bottom + 20}
								text-anchor="middle"
								class="fill-gray-600 text-xs"
							>
								{formatDate(data.date, 'MMM')}
							</text>
						{/each}
					</g>

					<!-- Chart title -->
					<text
						x={chartWidth / 2}
						y={20}
						text-anchor="middle"
						class="fill-gray-700 text-sm font-semibold"
					>
						Monthly Contributions
					</text>
				</svg>
			</div>
		</CardContent>
	</Card>

	<!-- Test 3: Stats Display -->
	<Card>
		<CardHeader>
			<CardTitle>Test 3: GitHub Stats (Text)</CardTitle>
			<CardDescription>Detailed contribution statistics</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<p class="text-sm font-semibold">Commit Contributions</p>
					<p class="text-2xl font-bold text-green-600">{stats.totalCommitContributions}</p>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-semibold">Issue Contributions</p>
					<p class="text-2xl font-bold text-yellow-600">{stats.totalIssueContributions}</p>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-semibold">Pull Request Contributions</p>
					<p class="text-2xl font-bold text-blue-600">{stats.totalPullRequestContributions}</p>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-semibold">Repositories with Commits</p>
					<p class="text-2xl font-bold text-purple-600">
						{stats.totalRepositoriesWithContributedCommits}
					</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Test 4: Simple Line Chart -->
	<Card>
		<CardHeader>
			<CardTitle>Test 4: Contribution Trend Line Chart (D3.js)</CardTitle>
			<CardDescription>Line chart showing contribution trends over time</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="w-full" bind:clientWidth={chartWidth}>
				<svg width={chartWidth} height={chartHeight}>
					<!-- Y-axis -->
					<g class="axis y-axis">
						{#each yTicks as tick (tick)}
							<g transform="translate(0, {yScale(tick)})">
								<line
									x1={padding.left}
									x2={chartWidth - padding.right}
									stroke="#e5e7eb"
									stroke-dasharray="2,2"
								/>
								<text x={padding.left - 10} y="4" text-anchor="end" class="fill-gray-600 text-xs">
									{tick}
								</text>
							</g>
						{/each}
					</g>

					<!-- Line path -->
					<path
						d="M {monthlyData
							.map((d, i) => {
								const barX = xScale(i.toString()) || 0;
								const barBandwidth = xScale.bandwidth();
								const x = barX + barBandwidth / 2;
								const y = yScale(d.contributionCount);
								return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
							})
							.join(' ')}"
						fill="none"
						stroke="#3b82f6"
						stroke-width="3"
						class="drop-shadow-sm"
					/>

					<!-- Data points -->
					{#each monthlyData as data, i (i)}
						{@const pointX = (xScale(i.toString()) || 0) + xScale.bandwidth() / 2}
						<circle
							cx={pointX}
							cy={yScale(data.contributionCount)}
							r="5"
							fill="#3b82f6"
							stroke="white"
							stroke-width="2"
							class="hover:r-8 transition-all"
						/>
					{/each}

					<!-- Chart title -->
					<text
						x={chartWidth / 2}
						y={20}
						text-anchor="middle"
						class="fill-gray-700 text-sm font-semibold"
					>
						Contribution Trend
					</text>
				</svg>
			</div>
		</CardContent>
	</Card>

	<!-- Test 5: Calendar Sample Data -->
	<Card>
		<CardHeader>
			<CardTitle>Test 5: Calendar Data Sample (Text)</CardTitle>
			<CardDescription>First 30 days of calendar data</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
				{#each calendarData.slice(0, 30) as day (day.date.toISOString())}
					<div class="flex flex-col items-center rounded border p-2">
						<span class="text-xs text-gray-600">{formatDate(day.date, 'MMM d')}</span>
						<div
							class="mt-1 size-8 rounded"
							style="background-color: {day.color}"
							title="{day.value} contributions"
						></div>
						<span class="mt-1 text-xs font-semibold">{day.value}</span>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Test 6: Simple Heatmap Grid -->
	<Card>
		<CardHeader>
			<CardTitle>Test 6: Weekly Heatmap (D3.js)</CardTitle>
			<CardDescription>First 7 weeks of contribution heatmap</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="w-full overflow-x-auto">
				<svg width={chartWidth} height="200">
					{#each Array(7) as _, week (week)}
						{#each Array(7) as _, day (day)}
							{@const index = week * 7 + day}
							{@const data = calendarData[index]}
							{#if data}
								<rect
									x={week * 20 + 10}
									y={day * 20 + 10}
									width="18"
									height="18"
									fill={data.color}
									rx="3"
									class="transition-opacity hover:opacity-80"
								>
									<title>{formatDate(data.date, 'MMM d, yyyy')}: {data.value} contributions</title>
								</rect>
							{/if}
						{/each}
					{/each}

					<!-- Legend -->
					<text x="10" y="180" class="fill-gray-600 text-xs">Less</text>
					{#each ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] as color, i (i)}
						<rect x={50 + i * 20} y="170" width="18" height="18" fill={color} rx="3" />
					{/each}
					<text x="200" y="180" class="fill-gray-600 text-xs">More</text>
				</svg>
			</div>
		</CardContent>
	</Card>

	<!-- SHADCN-SVELTE CHARTS TEST SECTION -->
	<div class="space-y-2">
		<h2 class="text-3xl font-bold">shadcn-svelte Charts (LayerChart v2 Test)</h2>
		<div
			class="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950"
		>
			<p class="text-sm">
				Testing <code class="rounded bg-purple-100 px-1 py-0.5 dark:bg-purple-900"
					>shadcn-svelte charts</code
				>
				with LayerChart v2 (pre-release). If this breaks with experimental.async, we'll remove it.
			</p>
		</div>
	</div>

	<!-- Test 7: shadcn-svelte Bar Chart -->
	<Card>
		<CardHeader>
			<CardTitle>Test 7: shadcn-svelte Bar Chart</CardTitle>
			<CardDescription>Using LayerChart v2 BarChart component</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<!-- Raw Data Text -->
				<div>
					<h3 class="mb-2 text-sm font-semibold">Monthly Contributions (Text):</h3>
					<div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-4">
						{#each monthlyData as data, i (i)}
							<div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
								<span class="font-medium">{formatDate(data.date, 'MMM yyyy')}:</span>
								<span class="text-muted-foreground">{data.contributionCount}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- LayerChart v2 Bar Chart -->
				<div>
					<p class="mb-2 text-sm font-semibold">LayerChart v2 Bar Chart (Testing Compatibility):</p>
					<div
						class="mb-4 rounded border border-yellow-300 bg-yellow-50 p-2 dark:border-yellow-700 dark:bg-yellow-950"
					>
						<p class="text-xs">
							⚠️ If you see this message and no chart below, LayerChart v2 is incompatible with
							experimental.async
						</p>
					</div>

					<ChartContainer config={chartConfig} class="h-[400px]">
						<BarChart data={chartData} x="month" y="contributions" />
					</ChartContainer>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Test 8: shadcn-svelte Area Chart -->
	<Card>
		<CardHeader>
			<CardTitle>Test 8: shadcn-svelte Area Chart</CardTitle>
			<CardDescription>Using LayerChart v2 AreaChart component</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<p class="text-sm font-semibold">Area Chart - Monthly Contributions:</p>
				<ChartContainer config={chartConfig} class="h-[400px]">
					<AreaChart data={chartData} x="month" y="contributions" />
				</ChartContainer>
			</div>
		</CardContent>
	</Card>

	<!-- Test 9: shadcn-svelte Line Chart -->
	<Card>
		<CardHeader>
			<CardTitle>Test 9: shadcn-svelte Line Chart</CardTitle>
			<CardDescription>Using LayerChart v2 LineChart component</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<p class="text-sm font-semibold">Line Chart - Monthly Contributions:</p>
				<ChartContainer config={chartConfig} class="h-[400px]">
					<LineChart data={chartData} x="month" y="contributions" />
				</ChartContainer>
			</div>
		</CardContent>
	</Card>

	<!-- Test 10: shadcn-svelte Pie Chart -->
	<Card>
		<CardHeader>
			<CardTitle>Test 10: shadcn-svelte Pie Chart</CardTitle>
			<CardDescription>Using LayerChart v2 PieChart component</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<!-- Raw Data Text -->
				<div>
					<h3 class="mb-2 text-sm font-semibold">Contribution Types (Text):</h3>
					<div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
						{#each contributionTypes as type (type.label)}
							<div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
								<span class="font-medium">{type.label}:</span>
								<span class="text-muted-foreground">{type.value}</span>
							</div>
						{/each}
					</div>
				</div>

				<p class="text-sm font-semibold">Pie Chart - Contribution Types:</p>
				<ChartContainer config={pieChartConfig} class="h-[400px]">
					<PieChart
						data={pieChartData}
						key="name"
						value="value"
						cRange={pieChartData.map((d) => d.color)}
						c="color"
						props={{
							pie: {
								motion: 'tween'
							}
						}}
					></PieChart>
				</ChartContainer>
			</div>
		</CardContent>
	</Card>
	<!-- Another Component Test -->
	<TestComp />

	<!-- Debug Info -->
	<Card>
		<CardHeader>
			<CardTitle>Debug Information</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div>
				<h3 class="mb-2 font-semibold">Monthly Data Sample (first 3):</h3>
				<pre
					class="overflow-x-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-900">{JSON.stringify(
						monthlyData.slice(0, 3),
						null,
						2
					)}</pre>
			</div>
			<div>
				<h3 class="mb-2 font-semibold">Calendar Data Sample (first 5):</h3>
				<pre
					class="overflow-x-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-900">{JSON.stringify(
						calendarData.slice(0, 5).map((d) => ({
							date: d.date.toISOString().split('T')[0],
							value: d.value,
							color: d.color
						})),
						null,
						2
					)}</pre>
			</div>
			<div>
				<h3 class="mb-2 font-semibold">Chart Dimensions:</h3>
				<ul class="text-muted-foreground list-inside list-disc space-y-1">
					<li>Chart Width: {chartWidth}px (responsive)</li>
					<li>Chart Height: {chartHeight}px</li>
					<li>Inner Width: {innerWidth}px</li>
					<li>Inner Height: {innerHeight}px</li>
					<li>Bar Width: {barWidth.toFixed(2)}px</li>
				</ul>
			</div>
		</CardContent>
	</Card>
</div>
