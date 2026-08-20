<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import { Calendar, Chart, Layer, Tooltip } from 'layerchart';
	import { scaleThreshold } from 'd3-scale';
	import { endOfInterval } from '@layerstack/utils';

	let { computed, year } = $props<{
		computed: any;
		year: string;
	}>();

	const yearNum = $derived(parseInt(year, 10));
	const firstDayOfYear = $derived(new Date(yearNum, 0, 1));
	const lastDayOfYear = $derived(endOfInterval('year', firstDayOfYear));

	const totalForYear = $derived(
		computed.calendarData.reduce((sum: number, d: any) => sum + d.value, 0)
	);
</script>

<div class="space-y-6">
	<!-- Full Year Calendar -->
	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Contribution Calendar</CardTitle>
			<CardDescription>
				Daily contribution activity throughout {year} — {totalForYear.toLocaleString()} total contributions
			</CardDescription>
		</CardHeader>
		<CardContent class="px-2 sm:px-6">
			<div class="w-full overflow-x-auto">
				<div class="h-[200px]">
					<Chart
						data={computed.calendarData}
						x="date"
						c="value"
						cScale={scaleThreshold().unknown('rgb(229 229 229)')}
						cDomain={[1, 4, 7, 11]}
						cRange={[
							'rgb(155 233 168)',
							'rgb(64 196 99)',
							'rgb(48 161 78)',
							'rgb(35 131 64)',
							'rgb(31 111 55)'
						]}
						padding={{ top: 24 }}
						tooltip
					>
						{#snippet children({ context })}
							<Layer type="svg">
								<Calendar
									start={firstDayOfYear}
									end={lastDayOfYear}
									tooltipContext={context.tooltip}
									monthPath
								/>
							</Layer>
							<Tooltip.Root>
								{#snippet children({ data })}
									<Tooltip.Header value={data.date} format="day" />
									{#if data.value != null}
										<Tooltip.List>
											<Tooltip.Item
												label="Contributions"
												value={data.value}
												format="integer"
												valueAlign="right"
											/>
										</Tooltip.List>
									{/if}
								{/snippet}
							</Tooltip.Root>
						{/snippet}
					</Chart>
				</div>
			</div>

			<!-- Legend -->
			<div
				class="text-muted-foreground mt-4 flex items-center justify-end gap-2 text-xs font-medium"
			>
				<span>Less</span>
				<div class="flex gap-0.5">
					<div class="bg-muted h-3 w-3 rounded-sm"></div>
					<div class="h-3 w-3 rounded-sm" style="background-color: rgb(155 233 168)"></div>
					<div class="h-3 w-3 rounded-sm" style="background-color: rgb(64 196 99)"></div>
					<div class="h-3 w-3 rounded-sm" style="background-color: rgb(48 161 78)"></div>
					<div class="h-3 w-3 rounded-sm" style="background-color: rgb(35 131 64)"></div>
				</div>
				<span>More</span>
			</div>
		</CardContent>
	</Card>

	<!-- Monthly Breakdown Grid — responsive: 1 col mobile, 2 cols tablet, 3 cols desktop -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each computed.monthlyData as monthData, i (monthData.month)}
			{@const monthIndex = i}
			{@const monthDays = computed.calendarData.filter((d: any) => {
				const date = new Date(d.date);
				return date.getMonth() === monthIndex && date.getFullYear() === yearNum;
			})}
			{@const monthTotal = monthDays.reduce((sum: number, d: any) => sum + d.value, 0)}
			{@const monthAvg = monthDays.length > 0 ? (monthTotal / monthDays.length).toFixed(1) : '0'}
			{@const maxDay = monthDays.reduce(
				(max: { value: number; date: string }, d: any) => (d.value > max.value ? d : max),
				{ value: 0, date: '' }
			)}
			{@const activeDays = monthDays.filter((d: any) => d.value > 0).length}
			<Card class="transition-all duration-200 hover:shadow-md">
				<CardHeader class="pb-2">
					<CardTitle class="text-sm font-bold">
						{new Date(yearNum, monthIndex, 1).toLocaleDateString('en-US', { month: 'long' })}
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2 pt-0">
					<div class="flex items-baseline justify-between">
						<span class="text-2xl font-bold tabular-nums">{monthTotal.toLocaleString()}</span>
						<span class="text-muted-foreground text-xs font-medium">
							{monthAvg}/day
						</span>
					</div>
					<div class="text-muted-foreground flex justify-between text-xs">
						<span>{activeDays} active days</span>
						{#if maxDay.value > 0}
							<span>Peak: {maxDay.value}</span>
						{/if}
					</div>
					<!-- Mini heatmap row for the month -->
					<div class="flex flex-wrap gap-px pt-1">
						{#each monthDays as day (day.date)}
							{@const level =
								day.value === 0
									? 0
									: day.value <= 3
										? 1
										: day.value <= 6
											? 2
											: day.value <= 10
												? 3
												: 4}
							<div
								class="h-2.5 w-2.5 rounded-sm transition-colors duration-150"
								style="background-color: {level === 0
									? 'rgb(229 229 229)'
									: level === 1
										? 'rgb(155 233 168)'
										: level === 2
											? 'rgb(64 196 99)'
											: level === 3
												? 'rgb(48 161 78)'
												: 'rgb(31 111 55)'}"
								title="{day.date}: {day.value} contributions"
							></div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>
