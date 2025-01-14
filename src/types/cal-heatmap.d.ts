import type { CalHeatmap } from 'cal-heatmap';

declare module 'cal-heatmap' {
	export default class CalHeatmap {
		constructor(options?: any);
		paint(): void;
		destroy(): void;
		// Add other methods and properties as needed
	}
}

declare module 'cal-heatmap/plugins/Legend' {
	const Legend: any;
	export default Legend;
}

declare module 'cal-heatmap/plugins/Tooltip' {
	const Tooltip: any;
	export default Tooltip;
}

declare module 'cal-heatmap/plugins/CalendarLabel' {
	const CalendarLabel: any;
	export default CalendarLabel;
}
