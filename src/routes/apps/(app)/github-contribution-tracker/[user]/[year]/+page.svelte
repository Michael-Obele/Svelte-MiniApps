<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowUp, ArrowLeft } from 'lucide-svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Chart, Bars, Calendar, Axis, Group, Text, Svg, Tooltip, Highlight } from 'layerchart';
	import { scaleBand, scaleThreshold } from 'd3-scale';
	import { format as formatDate } from 'date-fns';
	import { PeriodType, format } from 'svelte-ux';
	import { startOfYear, parseISO, endOfYear } from 'date-fns';
	import { flatGroup } from 'd3-array';
	import { scrollToID, scrollToTop, once, preventDefault } from '$lib/utils';

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

<h1 class="text-center text-2xl">GitHub Contributions</h1>

<h1 class="my-15 text-center text-xl">
	For <span class="capitalize">{user}</span> - {year}
</h1>
{#if data.streakStats}
	<div class="my-5">
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
<div class="mx-auto w-fit space-y-3 text-center">
	<h3>
		On {data.props.year}.
		<span>Your Total contributions are {data.totalContributions}</span>
	</h3>

	<div class="inline-flex w-full items-center justify-center">
		<hr class="my-8 h-[2px] w-64 rounded-xl border-0 bg-gray-200 dark:bg-gray-700" />
		<span
			class="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-2xl font-medium text-gray-900 dark:bg-gray-900 dark:text-white"
			>that's</span
		>
	</div>
</div>
<!-- Monthly Contributions -->
<div class="mx-auto h-[400px] w-[90vw] rounded border p-4">
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
<div class="mx-auto my-12 flex w-full flex-col space-y-3 text-center">
	<a
		href="#heatmap"
		class="text-center text-2xl font-medium hover:underline dark:text-blue-500"
		onclick={once(preventDefault(() => scrollToID('heatmap')))}
	>
		Scroll to Heat Map
	</a>
	<h3 class="text-center text-3xl font-bold text-gray-900 dark:text-white">More Stats</h3>
</div>

{#each contributionsByMonth as month, i}
	{#if month.some((day) => day.contributionCount > 0)}
		<div class="my-10 flex flex-col items-center justify-center space-y-2">
			<h3 class="text-center text-3xl font-bold text-gray-900 dark:text-white">
				{formatDate(month[i].date, 'MMMM yyyy')}
			</h3>
			<h5 class="text-center text-2xl font-bold text-gray-900 dark:text-white">
				Total Contributions: {month.reduce((a, b) => a + b.contributionCount, 0)}
			</h5>
			<Drawer.Root>
				<Drawer.Trigger class={buttonVariants({ variant: 'secondary' })}>View Chart</Drawer.Trigger>
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
						<Drawer.Close class={buttonVariants({ variant: 'destructive' })}>Close</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	{/if}
{/each}
<!-- End of More Stats -->

<div id="heatmap" class="my-12 inline-flex w-full items-center justify-center">
	<hr class="my-8 h-[2px] w-64 rounded-xl border-0 bg-gray-200 dark:bg-gray-700" />
	<span
		class="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-2xl font-medium text-gray-900 dark:bg-gray-900 dark:text-white"
		>Heat Map</span
	>
</div>

<div class="mx-auto h-[20vw] w-[95vw] rounded border p-4 pl-6 pt-6">
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

<div class="mx-auto my-10 flex w-fit items-center justify-center">
	<Button
		class="group me-2 inline-flex items-center justify-center rounded-lg border border-green-700 bg-green-500 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-100 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-800 md:text-xl"
		onclick={() => goto('/apps/github-contribution-tracker')}
	>
		<ArrowLeft class="h-6 w-6 md:mr-2" />
		<span class="hidden md:inline"> Go Back </span>
	</Button>

	<Button
		class="group me-2 inline-flex items-center justify-center rounded-lg border border-green-700 bg-green-500 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-100 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-800 md:text-xl"
		onclick={scrollToTop}
	>
		<span class="hidden md:inline">Back to Top</span>
		<ArrowUp class="h-6 w-6 md:ml-2" />
	</Button>
</div>
