<script lang="ts">
	//@ts-expect-error
	import CalHeatmap from 'cal-heatmap';
	//@ts-expect-error
	import Legend from 'cal-heatmap/plugins/Legend';
	//@ts-expect-error
	import Tooltip from 'cal-heatmap/plugins/Tooltip';
	//@ts-expect-error
	import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel';
	import 'cal-heatmap/cal-heatmap.css';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import weekday from 'dayjs/plugin/weekday';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	import { MediaQuery } from 'svelte/reactivity';
	import { writable } from 'svelte/store';

	// types.ts
	interface ContributionDay {
		date: Date;
		value: number;
		contributionCount: number;
	}

	type GitGraphProps = {
		options?: CalHeatmapOptions;
		range?: number;
		start?: number;
		user?: string;
		year?: number;
		data: ContributionDay[] | null;
	};

	interface CalHeatmapOptions {
		verticalOrientation?: boolean;
		theme?: 'light' | 'dark';
		[key: string]: any;
	}

	const small = new MediaQuery('max-width: 599px');
	const medium = new MediaQuery('min-width: 600px');
	const large = new MediaQuery('min-width: 1024px');
	const error = writable<Error | null>(null);

	let { range, options = {}, start, data = null, year }: GitGraphProps = $props();

	// Instantiate CalHeatmap
	let cal: CalHeatmap;

	$effect(() => {
		cal = new CalHeatmap();

		try {
			cal.paint(
				{
					data: { source: data, x: 'date', y: 'value', defaultValue: 0 },
					date: {
						locale: `en`,
						start: new Date(`${year}-0${start}-01`)
					},
					verticalOrientation: false,
					range: range,
					scale: { color: { type: 'linear', scheme: 'greens', domain: [0, 4] } },
					domain: {
						type: 'month',
						gutter: 4,
						label: { text: 'MMM', textAlign: 'start', position: 'top' }
					},
					subDomain: {
						type: 'ghDay',
						radius: 2,
						width: small.current ? 10 : medium.current ? 11 : 12,
						height: small.current ? 10 : medium.current ? 11 : 12,
						gutter: 4
					},
					...options
				},
				[
					[
						Tooltip,
						{
							text: (date: Date, value: number, dayjsDate: any) =>
								`${value || 'No'} contributions on ${dayjsDate.format('dddd, MMMM D, YYYY')}`
						}
					],
					[
						Legend,
						{
							tickSize: 0,
							width: 150,
							itemSelector: '#contribution-legend',
							label: 'Contributions'
						}
					],
					[
						CalendarLabel,
						{
							width: 30,
							textAlign: 'start',
							text: () => {
								const weekdays = [...Array(7)].map((_, i) =>
									new Intl.DateTimeFormat('en', { weekday: 'short' }).format(
										new Date(2024, 0, i + 1)
									)
								);
								return weekdays.map((d, i) => (i % 2 !== 0 ? '' : d));
							},
							padding: [25, 0, 0, 0]
						}
					]
				]
			);
		} catch (err) {
			error.set(err as Error);
		}
	});
</script>

{#if $error}
	<div
		class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
		role="alert"
	>
		<strong class="font-bold">Error:</strong>
		<span class="block sm:inline">{$error.message}</span>
	</div>
{:else}
	<div
		class="container mx-auto flex flex-col justify-center px-4 py-8"
		role="region"
		aria-label="GitHub Contribution Graph"
	>
		<div id="contribution-legend"></div>
		<div id="cal-heatmap"></div>
	</div>
{/if}
