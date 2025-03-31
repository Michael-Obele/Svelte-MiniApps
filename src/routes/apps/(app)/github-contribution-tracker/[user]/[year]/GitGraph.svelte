<script lang="ts">
	import CalHeatmap from 'cal-heatmap';
	import Legend from 'cal-heatmap/plugins/Legend';
	import Tooltip from 'cal-heatmap/plugins/Tooltip';
	import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel';
	import 'cal-heatmap/cal-heatmap.css';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import weekday from 'dayjs/plugin/weekday';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	import timezone from 'dayjs/plugin/timezone';
	import utc from 'dayjs/plugin/utc';
	import { MediaQuery } from 'svelte/reactivity';
	import { writable } from 'svelte/store';
	import { format } from 'date-fns';
	import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

	dayjs.extend(weekday);
	dayjs.extend(localizedFormat);
	dayjs.extend(timezone);
	dayjs.extend(utc);

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

	// Extended plugin options for our specific plugins
	interface TooltipOptions extends CalHeatmap.PluginOptions {
		text: (date: any, value: number) => string;
	}

	interface LegendOptions extends CalHeatmap.PluginOptions {
		tickSize: number;
		width: number;
		itemSelector: string;
		label: string;
	}

	interface CalendarLabelOptions extends CalHeatmap.PluginOptions {
		width: number;
		textAlign: string;
		text: () => string[];
		padding: number[];
	}

	const small = new MediaQuery('max-width: 25rem');
	const medium = new MediaQuery('max-width: 26.5rem');
	const large = new MediaQuery('min-width: 27rem');
	const error = writable<Error | null>(null);

	let {
		range,
		options = {},
		start = 1,
		data = null,
		year = new Date().getFullYear()
	}: GitGraphProps = $props();

	// Function to determine size based on media queries
	function getSize() {
		return small.current ? 8 : medium.current ? 10 : large.current ? 12 : 15;
	}

	// Instantiate CalHeatmap
	let cal: CalHeatmap;

	onMount(() => {
		cal = new CalHeatmap();

		// $inspect(data);

		try {
			cal.paint(
				{
					data: { source: data, x: 'date', y: 'value', defaultValue: 0 },
					date: {
						locale: `en`,
						start: new Date(Date.UTC(year, start - 1, 1)),
						min: new Date(Date.UTC(year))
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
						width: getSize(),
						height: getSize(),
						gutter: 4
					},
					...options
				},
				[
					[
						Tooltip as unknown as CalHeatmap.IPluginContructor,
						{
							text: (date: any, value: number) => {
								console.log('Date in milliseconds:', date);

								// Ensure we're working with UTC
								const utcDateFromMs = new Date(Number(date));
								console.log('Initial Date Object:', utcDateFromMs);

								// Convert to UTC if not already in UTC
								const utcDate = dayjs.utc(utcDateFromMs).toDate();
								utcDate.setHours(utcDate.getHours() + 24);
								console.log('UTC Date:', utcDate.toISOString());

								// Get the user's local timezone
								const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

								// Format the date in the user's local timezone, ensuring we're starting from UTC
								return `${value || 'No'} contributions on ${formatInTimeZone(
									utcDate,
									localTz,
									'EEEE, MMMM d, yyyy'
								)}`;
							}
						} as TooltipOptions
					],
					[
						Legend as unknown as CalHeatmap.IPluginContructor,
						{
							tickSize: 0,
							width: 150,
							itemSelector: '#contribution-legend',
							label: 'Contributions'
						} as LegendOptions
					],
					[
						CalendarLabel as unknown as CalHeatmap.IPluginContructor,
						{
							width: 30,
							textAlign: 'start',
							text: () => {
								const weekdays = Array.from(
									{ length: 7 },
									(_, i) => format(new Date(2024, 0, i + 1), 'E') // 'E' for short day name
								);
								return weekdays.map((d, i) => (i % 2 !== 0 ? '' : d));
							},
							padding: [25, 0, 0, 0]
						} as CalendarLabelOptions
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
		class="container mx-auto flex flex-col justify-center space-y-3 px-4 py-8"
		role="region"
		aria-label="GitHub Contribution Graph"
	>
		<div id="contribution-legend"></div>
		<div id="cal-heatmap"></div>
	</div>
{/if}
