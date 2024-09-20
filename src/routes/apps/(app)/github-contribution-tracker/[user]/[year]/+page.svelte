<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowUp, ArrowLeft } from 'lucide-svelte';
	import SvelteHeatmap from 'svelte-heatmap';
	import { Button } from '$lib/components/ui/button/index.js';
	export let data;
	const year: string = data.props.year;
	const user: string = data.props.user;

	let monthAbs = data.monthAbs;

	import { scaleBand } from 'd3-scale';
	import { format as formatDate } from 'date-fns';

	import {
		Chart,
		Bars,
		Calendar,
		Axis,
		Group,
		Text,
		Svg,
		Tooltip,
		Highlight,
		TooltipItem
	} from 'layerchart';

	interface ContributionItem {
		date: string;
		contributionCount: number;
	}

	function arrangeDataByMonth(data: ContributionItem[]): ContributionItem[][] {
		const monthlyData: ContributionItem[][] = Array(12)
			.fill(null)
			.map(() => []);

		data.forEach((item: ContributionItem) => {
			const date = new Date(item.date);
			const monthIndex = date.getMonth();

			monthlyData[monthIndex].push(item);
		});

		return monthlyData;
	}

	function calculateMonthlyContributions(
		data: ContributionItem[][]
	): { date: Date; contributionCount: number }[] {
		return data.map((monthData, monthIndex) => {
			const date = new Date(monthData[0].date); // Get the date from the first item of the month
			const contributionCount = monthData.reduce((sum, item) => sum + item.contributionCount, 0);

			return { date, contributionCount };
		});
	}

	const contributionsByMonth = arrangeDataByMonth(data.gitContributions);

	const monthlyContributionData = calculateMonthlyContributions(contributionsByMonth);

	import { PeriodType, format } from 'svelte-ux';
	import { startOfYear, parseISO, endOfYear } from 'date-fns';
	import { scaleThreshold } from 'd3-scale';
	import { range } from 'd3-array';
	import { scrollToID, scrollToTop } from '$lib/utils.js';

	import { flatGroup, sum } from 'd3-array';

	import { sortFunc } from 'svelte-ux';

	$: calendarDataByYear = flatGroup(data.calendar ?? [], (d) => parseISO(d.date).getFullYear());
	sortFunc((d) => d[0], 'desc');

	const dataSet = data.gitContributions.map((d) => {
		return {
			...d,
			value: d.contributionCount
		};
	});

	console.log(dataSet);

	const now = new Date();
	const firstDayOfYear = startOfYear(now);
	const lastDayOfYear = endOfYear(now);
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
			class="mx-auto flex w-full justify-center"
			contenteditable="false"
			bind:innerHTML={data.streakStats}
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
		<Tooltip
			class="bg-red-800 fill-green-400 dark:bg-red-500 dark:text-black"
			header={(data) => formatDate(data.date, 'MMMM')}
			let:data
		>
			<TooltipItem
				class="text-black dark:text-slate-900"
				label="Contributions"
				value={data.contributionCount}
			/>
		</Tooltip>
	</Chart>
</div>

<div class="h-[200px] rounded border p-4">
	<Chart
		data={dataSet}
		x={'date'}
		r={'value'}
		rScale={scaleThreshold().unknown('transparent')}
		rDomain={[2, 5, 7, 10]}
		rRange={[
			'hsl(var(--color-primary-100))',
			'hsl(var(--color-primary-300))',
			'hsl(var(--color-primary-500))',
			'hsl(var(--color-primary-700))'
		]}
		let:tooltip
	>
		<Svg>
			<Calendar start={firstDayOfYear} end={lastDayOfYear} {tooltip} monthPath />
		</Svg>

		<Tooltip header={(d) => format(d.date, PeriodType.Day)} />
	</Chart>
</div>

<!-- More Stats -->
<div class="mx-auto my-12 flex w-full flex-col space-y-3 text-center">
	<a
		href="#heatmap"
		class="text-center text-2xl font-medium hover:underline dark:text-blue-500"
		on:click|preventDefault={() => scrollToID('heatmap')}
	>
		Scroll to Heat Map
	</a>
	<h3 class="text-center text-3xl font-bold text-gray-900 dark:text-white">More Stats</h3>
</div>

{#each contributionsByMonth as month, i}
	{#if month.some((day) => day.contributionCount > 0)}
		<h3 class="my-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
			{formatDate(month[i].date, 'MMMM yyyy')}
		</h3>
		<div class="mx-auto h-[800px] w-[80vw] rounded border p-4">
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
				<Tooltip
					class="bg-red-800 fill-green-400 dark:bg-red-500 dark:text-black"
					header={(data) => formatDate(data.date, 'eee, MMMM do')}
					let:data
				>
					<TooltipItem label="contributionCount" value={data.contributionCount} />
				</Tooltip>
			</Chart>
		</div>
	{/if}
{/each}
<!-- End of More Stats -->

<div
	class="overflow-hidden rounded border p-4"
	style:height="{140 * calendarDataByYear.length + 16}px"
>
	<Chart
		data={dataSet}
		x="date"
		r="value"
		rScale={scaleThreshold().unknown('transparent')}
		rDomain={[1, 10, 20, 30]}
		rRange={[
			'hsl(var(--color-surface-100))',
			'hsl(var(--color-primary-300))',
			'hsl(var(--color-primary-500))',
			'hsl(var(--color-primary-700))',
			'hsl(var(--color-primary-900))'
		]}
		padding={{ top: 8, left: 20 }}
		let:tooltip
	>
		<Svg>
			{#each calendarDataByYear as [year, calendarData], i}
				{@const start = startOfYear(calendarData[0].date)}
				{@const end = endOfYear(calendarData[calendarData.length - 1].date)}
				<Group y={140 * i}>
					<Text
						value={year}
						class="text-xs"
						rotate={270}
						x={-20}
						y={(16 * 7) / 2}
						textAnchor="middle"
						verticalAnchor="start"
					/>
					<Calendar {start} {end} {tooltip} cellSize={16} monthPath />
				</Group>
			{/each}
		</Svg>

		<Tooltip header={(d) => format(d.date, PeriodType.Day)} let:data>
			{#if data?.value != null}
				<TooltipItem label="Contributions" value={data.value} format="integer" valueAlign="right" />
			{/if}
		</Tooltip>
	</Chart>
</div>

<div id="heatmap" class="my-12 inline-flex w-full items-center justify-center">
	<hr class="my-8 h-[2px] w-64 rounded-xl border-0 bg-gray-200 dark:bg-gray-700" />
	<span
		class="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-2xl font-medium text-gray-900 dark:bg-gray-900 dark:text-white"
		>Heat Map</span
	>
</div>

<div class="mx-auto w-full space-y-8 px-6 py-5 lg:hidden">
	<SvelteHeatmap
		allowOverflow={true}
		cellGap={3}
		fontColor={'white'}
		cellRadius={1}
		colors={['#a1dab4', '#42b6c4', '#2c7fb9', '#263494']}
		data={data.page_data.dataSet}
		dayLabelWidth={3}
		emptyColor={'#ecedf0'}
		monthLabels={monthAbs.map((month) => month.name)}
		endDate={`${year}-04-01T03:00:00.000Z`}
		monthGap={10}
		monthLabelHeight={8}
		startDate={`${year}-01-01T03:00:00.000Z`}
		view={'monthly'}
	/>
	<SvelteHeatmap
		allowOverflow={true}
		cellGap={3}
		fontColor={'white'}
		cellRadius={1}
		colors={['#a1dab4', '#42b6c4', '#2c7fb9', '#263494']}
		data={data.page_data.dataSet}
		dayLabelWidth={3}
		emptyColor={'#ecedf0'}
		monthLabels={monthAbs.map((month) => month.name)}
		endDate={`${year}-08-01T03:00:00.000Z`}
		monthGap={10}
		monthLabelHeight={8}
		startDate={`${year}-05-01T03:00:00.000Z`}
		view={'monthly'}
	/>
	<SvelteHeatmap
		allowOverflow={true}
		cellGap={3}
		fontColor={'white'}
		cellRadius={1}
		colors={['#a1dab4', '#42b6c4', '#2c7fb9', '#263494']}
		data={data.page_data.dataSet}
		dayLabelWidth={5}
		emptyColor={'#ecedf0'}
		monthLabels={monthAbs.map((month) => month.name)}
		endDate={`${year}-12-01T03:00:00.000Z`}
		monthGap={10}
		monthLabelHeight={8}
		startDate={`${year}-09-01T03:00:00.000Z`}
		view={'monthly'}
	/>
</div>

<div class="mx-auto hidden w-full space-y-10 px-6 py-2 lg:block">
	<SvelteHeatmap
		allowOverflow={true}
		cellGap={3}
		dayLabelWidth={2}
		dayLabels={['', 'Mon', '', 'Web', '', 'Fri', '']}
		fontColor={'white'}
		cellRadius={1}
		colors={['#a1dab4', '#42b6c4', '#2c7fb9', '#263494']}
		data={data.page_data.dataSet}
		emptyColor={'#ecedf0'}
		monthLabels={monthAbs.map((month) => month.name)}
		endDate={`${year}-06-01T03:00:00.000Z`}
		monthGap={8}
		monthLabelHeight={25}
		startDate={`${year}-01-01T03:00:00.000Z`}
		view={'monthly'}
	/>
	<SvelteHeatmap
		allowOverflow={true}
		cellGap={3}
		dayLabelWidth={2}
		dayLabels={['', 'Mon', '', 'Web', '', 'Fri', '']}
		fontColor={'white'}
		cellRadius={1}
		colors={['#a1dab4', '#42b6c4', '#2c7fb9', '#263494']}
		data={data.page_data.dataSet}
		emptyColor={'#ecedf0'}
		monthLabels={monthAbs.map((month) => month.name)}
		endDate={`${year}-12-01T03:00:00.000Z`}
		monthGap={8}
		monthLabelHeight={25}
		startDate={`${year}-07-01T03:00:00.000Z`}
		view={'monthly'}
	/>
</div>

<div class="mx-auto my-10 flex w-fit space-x-4">
	<Button
		class="group me-2 inline-flex items-center justify-center rounded-lg border border-green-700 bg-green-500 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-100 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-800 md:text-xl"
		on:click={() => goto('/apps/github-contribution-tracker')}
	>
		<ArrowLeft class="h-6 w-6 md:mr-2" />
		<span class="hidden md:inline"> Go Back </span>
	</Button>

	<Button
		class="group me-2 inline-flex items-center justify-center rounded-lg border border-green-700 bg-green-500 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-100 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-800 md:text-xl"
		on:click={scrollToTop}
	>
		<span class="hidden md:inline">Back to Top</span>
		<ArrowUp class="h-6 w-6 md:ml-2" />
	</Button>
</div>
