<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import { format as formatDate } from 'date-fns';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let { computed, year } = $props<{
		computed: any;
		year: string;
	}>();
</script>

<Card>
	<CardHeader>
		<CardTitle>Contribution Calendar</CardTitle>
		<CardDescription>Daily contribution activity throughout {year}</CardDescription>
	</CardHeader>
	<CardContent class="px-2 sm:px-6">
		<!-- GitHub-style contribution grid -->
		<div class="w-full overflow-x-auto">
			<div class="inline-block h-fit min-w-full pt-2">
				<!-- Legend -->
				<div class="text-muted-foreground mb-4 flex items-center justify-between text-xs">
					<span>Less</span>
					<div class="flex gap-1">
						<div class="bg-muted h-3 w-3 rounded-sm"></div>
						<div class="h-3 w-3 rounded-sm bg-green-100 dark:bg-green-950"></div>
						<div class="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-800"></div>
						<div class="h-3 w-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
						<div class="h-3 w-3 rounded-sm bg-green-700 dark:bg-green-400"></div>
					</div>
					<span>More</span>
				</div>

				<!-- Contribution grid -->
				<div class="flex gap-1">
					<!-- Month labels (left side) -->
					<div class="text-muted-foreground flex flex-col justify-around text-xs">
						<span>Mon</span>
						<span>Wed</span>
						<span>Fri</span>
					</div>

					<!-- Days grid -->
					<div class="flex-1">
						<div class="grid grid-flow-col grid-rows-7 gap-1">
							{#each computed.calendarData as day, i (day.date)}
								{@const rowIndex = i % 7}
								{@const colIndex = Math.floor(i / 7)}
								{@const totalCols = Math.ceil(computed.calendarData.length / 7)}
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
								{@const bgColor =
									level === 0
										? 'bg-muted'
										: level === 1
											? 'bg-green-100 dark:bg-green-950'
											: level === 2
												? 'bg-green-300 dark:bg-green-800'
												: level === 3
													? 'bg-green-500 dark:bg-green-600'
													: 'bg-green-700 dark:bg-green-400'}
								<div
									class="group relative h-3 w-3 cursor-pointer rounded-sm {bgColor} hover:ring-primary transition-all duration-200 hover:z-50 hover:scale-125 hover:ring-2"
								>
									<!-- Enhanced tooltip on hover -->
									<div
										class="bg-popover pointer-events-none absolute z-50 hidden rounded-lg border px-3 py-2 text-xs whitespace-nowrap shadow-lg group-hover:block {rowIndex <
										2
											? 'top-full mt-2'
											: 'bottom-full mb-2'} {colIndex < 5
											? 'left-0 translate-x-0'
											: colIndex > totalCols - 8
												? 'right-0 translate-x-0'
												: 'left-1/2 -translate-x-1/2'}"
									>
										<div class="font-semibold">{day.value} contributions</div>
										<div class="text-muted-foreground">
											{formatDate(day.date, 'EEEE, MMMM d, yyyy')}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
