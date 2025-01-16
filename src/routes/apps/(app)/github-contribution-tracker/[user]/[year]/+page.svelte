<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowUp, ArrowLeft, ArrowDown, RotateCw } from 'lucide-svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Chart, Bars, Calendar, Axis, Group, Text, Svg, Tooltip, Highlight } from 'layerchart';
	import { scaleBand, scaleThreshold } from 'd3-scale';
	import { format as formatDate } from 'date-fns';
	import { PeriodType, format } from 'svelte-ux';
	import { startOfYear, parseISO, endOfYear } from 'date-fns';
	import { flatGroup } from 'd3-array';
	import { scrollToID, scrollToTop } from '$lib/utils';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import GitGraph from './GitGraph.svelte';

	let { data } = $props();

	const year = $state(data.props.year);
	const user = $state(data.props.user);

	interface ContributionItem {
		date: string;
		contributionCount: number;
	}

	// Data processing functions
	const arrangeDataByMonth = (data: ContributionItem[]): ContributionItem[][] => {
		const monthlyData: ContributionItem[][] = Array(12)
			.fill(null)
			.map(() => []);

		data.forEach((item: ContributionItem) => {
			const date = new Date(item.date);
			monthlyData[date.getMonth()].push(item);
		});

		return monthlyData;
	};

	const calculateMonthlyContributions = (
		data: ContributionItem[][]
	): { date: Date; contributionCount: number }[] => {
		return data.map((monthData) => ({
			date: new Date(monthData[0]?.date ?? new Date()),
			contributionCount: monthData.reduce((sum, item) => sum + item.contributionCount, 0)
		}));
	};

	// Reactive declarations
	let contributionsByMonth = $state(arrangeDataByMonth(data.gitContributions));
	let monthlyContributionData = $state(calculateMonthlyContributions(contributionsByMonth));
	let calendarData = $state(
		data.calendar.map((d) => ({
			...d,
			date: parseISO(d.date),
			value: d.contributionCount
		}))
	);
	let calendarDataByYear = $state(flatGroup(calendarData, (d: any) => d.date.getFullYear()));
</script>

<svelte:head>
	<title>{user} - GitHub Contributions in {year}</title>
	<meta
		name="description"
		content="Visualize {user}'s GitHub contributions for {year} with interactive charts and heatmaps. Track their coding activity, streaks, and more."
	/>
</svelte:head>

<div class="mx-auto my-8 max-w-3xl space-y-6 text-center">
	<div class="space-y-4">
		<h1
			class="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-white/70 sm:text-5xl"
		>
			GitHub Contributions
		</h1>
		<h2 class="text-2xl text-gray-700 dark:text-gray-200">
			For <span
				class="font-semibold capitalize text-primary transition-colors hover:text-primary/80 dark:text-white"
				>{user}</span
			>
			<span class="mx-2 text-gray-400">•</span>
			<span class="font-bold text-primary dark:text-white">{year}</span>
		</h2>
	</div>

	{#if data.streakStats}
		<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
			<div
				class="mx-auto flex w-full justify-center dark:hidden"
				contenteditable="false"
				bind:innerHTML={data.streakStats.light}
			></div>
			<div
				class="mx-auto hidden w-full justify-center dark:flex"
				contenteditable="false"
				bind:innerHTML={data.streakStats.dark}
			></div>
		</div>
	{/if}

	<p class="text-lg text-gray-600 dark:text-gray-300">
		In {data.props.year}, you made
		<span
			class="inline-block font-bold text-primary transition-all hover:scale-105 dark:text-white"
		>
			{data.totalContributions}
		</span>
		{@render contribution(data.totalContributions)}
	</p>
</div>

<!-- Snippet for pluralization -->
{#snippet contribution(number: number)}
	{#if number === 1}
		contribution
	{:else}
		contributions
	{/if}
{/snippet}
<!-- End of Snippet -->

<!-- Monthly Contributions -->
<div class="container mx-auto h-[400px] w-[90vw] rounded border p-4">
	<Chart
		data={monthlyContributionData}
		x="date"
		xScale={scaleBand().padding(0.4)}
		y="contributionCount"
		yDomain={[0, null]}
		yNice={4}
		padding={{ left: 16, bottom: 24 }}
		tooltip={{ mode: 'band' }}
	>
		<Svg>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" format={(d) => formatDate(d, 'MMM')} rule />
			<Bars radius={4} strokeWidth={1} class="fill-green-700 dark:fill-green-500" />
			<Highlight area />
		</Svg>

		<Tooltip.Root
			class="bg-red-800 fill-green-400 dark:bg-red-500 dark:text-black"
			offset={8}
			placement="top"
			let:data
		>
			<Tooltip.Header>{formatDate(data.date, 'MMMM')}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item
					class="text-black dark:text-slate-900"
					label="Contributions"
					value={data.contributionCount}
				/>
			</Tooltip.List>
		</Tooltip.Root>
	</Chart>
</div>

<!-- More Stats -->
<div class="container mx-auto my-8 px-4">
	<Card class="w-full">
		<CardContent class="flex flex-col items-center space-y-4 p-6">
			<Button
				variant="ghost"
				class="group text-2xl font-medium transition-colors hover:text-primary"
				onclick={() => scrollToID('heatmap')}
			>
				<span class="mr-2">View Contribution Heat Map</span>
				<ArrowDown class="h-5 w-5 transition-transform group-hover:translate-y-1" />
			</Button>

			<div class="flex w-full items-center justify-center">
				<div class="h-px w-full bg-border"></div>
				<span class="bg-background px-6 text-3xl font-bold"> More Stats </span>
				<div class="h-px w-full bg-border"></div>
			</div>
		</CardContent>
	</Card>
</div>

<!-- Each Month -->
<div class="container mx-auto px-4">
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each contributionsByMonth as month, i}
			{#if month.some((day) => day.contributionCount > 0)}
				<Card class="flex flex-col">
					<CardHeader>
						<CardTitle class="text-xl font-bold text-gray-900 dark:text-white">
							{formatDate(month[i].date, 'MMMM yyyy')}
						</CardTitle>
						<CardDescription>
							Total Contributions: {month.reduce((a, b) => a + b.contributionCount, 0)}
						</CardDescription>
					</CardHeader>
					<CardContent class="flex-grow">
						<Drawer.Root>
							<Drawer.Trigger class={buttonVariants({ variant: 'secondary', class: 'w-full' })}>
								View Chart
							</Drawer.Trigger>
							<Drawer.Content class="px-3">
								<div class="mt-5 h-[80vh] w-full rounded border p-4 md:mx-auto md:w-[80vw]">
									<Chart
										data={month}
										x="contributionCount"
										y="date"
										xDomain={[0, null]}
										xNice
										yScale={scaleBand().padding(0.4)}
										padding={{ left: 20, bottom: 20 }}
										tooltip={{ mode: 'band' }}
									>
										<Svg>
											<Axis placement="bottom" grid rule />
											<Axis placement="left" format={(d) => formatDate(d, 'dd MMM')} grid rule />
											<Bars
												radius={4}
												rounded="right"
												strokeWidth={1}
												class="fill-green-700 dark:fill-green-500"
											/>
											<Highlight area />
										</Svg>
										<Tooltip.Root
											offset={12}
											placement="right"
											class="bg-red-800 fill-green-400 dark:bg-red-500 dark:text-black"
											let:data
										>
											<Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
											<Tooltip.List>
												<Tooltip.Item label="contributionCount" value={data.contributionCount} />
											</Tooltip.List>
										</Tooltip.Root>
									</Chart>
								</div>
								<Drawer.Footer>
									<Drawer.Close class={buttonVariants({ variant: 'destructive' })}
										>Close</Drawer.Close
									>
								</Drawer.Footer>
							</Drawer.Content>
						</Drawer.Root>
					</CardContent>
				</Card>
			{/if}
		{/each}
	</div>
</div>

<!-- End of More Stats -->

<div id="heatmap" class="relative my-16 flex w-full items-center justify-center overflow-hidden">
	<div class="absolute inset-0 flex items-center">
		<div
			class="border-gradient-to-r w-full border-t from-gray-200/0 via-gray-200 to-gray-200/0 dark:from-gray-700/0 dark:via-gray-700 dark:to-gray-700/0"
		></div>
	</div>
	<div class="relative flex justify-center text-2xl font-medium">
		<span class="bg-background px-6 text-gray-900 transition-colors dark:text-white">
			<span
				class="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent dark:from-white dark:to-white/70"
			>
				Heat Map
			</span>
		</span>
	</div>
</div>

<!-- Beginning of Heat Map Large Screen -->
<div class="mx-auto hidden h-[20vw] w-[95vw] rounded border p-4 pl-6 pt-6 md:block">
	<Chart
		data={calendarData}
		x="date"
		c="value"
		cScale={scaleThreshold().unknown('transparent')}
		cDomain={[1, 3, 6, 10]}
		cRange={['#ebf8e1', '#74c476', '#238b45', '#006d2c']}
		let:tooltip
	>
		<Svg>
			{#each calendarDataByYear as [year, calendarData], i}
				{@const start = startOfYear(calendarData[0].date)}
				{@const end = endOfYear(calendarData[calendarData.length - 1].date)}
				<Group y={140 * i}>
					<Text
						value={year}
						class="left-5 mx-3 p-5 text-xs"
						rotate={270}
						x={-20}
						y={(16 * 7) / 2}
						textAnchor="middle"
						verticalAnchor="start"
					/>
					<Calendar {start} {end} {tooltip} monthPath />
				</Group>
			{/each}
		</Svg>

		<Tooltip.Root offset={16} placement="top" let:data>
			<Tooltip.Header>{format(data.date, PeriodType.Day)}</Tooltip.Header>
			{#if data?.value != null}
				<Tooltip.List>
					<Tooltip.Item
						label="Contributions"
						value={data.value}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/if}
		</Tooltip.Root>
	</Chart>
</div>
<!-- End of Heat Map Large Screen -->

<!-- Beginning of Heat Map Small Screen -->
<div class="md:hidden">
	<GitGraph data={calendarData} options={{}} range={6} start={1} year={Number(year)} />

	<GitGraph data={calendarData} options={{}} range={6} start={7} year={Number(year)} />
</div>
<!-- End of Heat Map Small Screen -->

<div class="mx-auto my-10 flex w-fit items-center justify-center gap-4">
	<Button
		variant="outline"
		class="group relative transform-gpu transition-all duration-300 hover:scale-105 hover:shadow-lg"
		onclick={() => goto('/apps/github-contribution-tracker')}
	>
		<ArrowLeft
			class="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 md:mr-2"
		/>
		<span class="hidden md:inline">Go Back</span>
	</Button>

	<Button
		variant="outline"
		class="group relative transform-gpu transition-all duration-300 hover:scale-105 hover:shadow-lg"
		onclick={scrollToTop}
	>
		<span class="hidden md:inline">Back to Top</span>
		<ArrowUp class="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 md:ml-2" />
	</Button>

	<Button
		variant="outline"
		class="group relative transform-gpu transition-all duration-300 hover:scale-105 hover:shadow-lg"
		onclick={() => location.reload()}
	>
		<RotateCw class="h-5 w-5 transition-transform duration-300 group-hover:rotate-180 md:ml-2" />
		<span class="hidden md:inline">Reload Page</span>
	</Button>
</div>
