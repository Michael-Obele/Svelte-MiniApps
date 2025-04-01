declare module 'cal-heatmap' {
	import type { PluginFunc } from 'dayjs';
	import type dayjs from 'dayjs';

	namespace CalHeatmap {
		export type Timestamp = number;
		export type DomainType =
			| 'year'
			| 'month'
			| 'week'
			| 'xDay'
			| 'ghDay'
			| 'day'
			| 'hour'
			| 'minute';

		export type DeepPartial<T> = T extends object
			? {
					[P in keyof T]?: DeepPartial<T[P]>;
				}
			: T;

		export type Template = {
			(dateHelper: any, options: any): TemplateResult;
		};

		export type TemplateResult = {
			name: string;
			parent?: string;
			allowedDomainType: DomainType[];
			rowsCount: (ts: Timestamp) => number;
			columnsCount: (ts: Timestamp) => number;
			mapping: (startTimestamp: Timestamp, endTimestamp: Timestamp) => SubDomain[];
			extractUnit: (ts: Timestamp) => Timestamp;
		};

		export type SubDomain = {
			t: Timestamp;
			x: number;
			y: number;
			v?: number | string | null;
		};

		export type Dimensions = {
			width: number;
			height: number;
		};

		export interface IPlugin {
			name: string;
			calendar: CalHeatmap;
			options: PluginOptions;
			root: any;

			setup: (options?: PluginOptions) => void;
			paint: () => Promise<unknown>;
			destroy: () => Promise<unknown>;
		}

		export interface IPluginContructor {
			new (calendar: CalHeatmap): IPlugin;
		}

		export interface PluginOptions {
			position?: 'top' | 'right' | 'bottom' | 'left';
			dimensions?: Dimensions;
			key?: string;
		}

		export interface TooltipOptions extends PluginOptions {
			text?: (date: any, value: number) => string;
		}

		export interface LegendOptions extends PluginOptions {
			tickSize?: number;
			width?: number;
			itemSelector?: string;
			label?: string;
		}

		export interface CalendarLabelOptions extends PluginOptions {
			width?: number;
			textAlign?: string;
			text?: () => string[];
			padding?: number[];
		}

		export type PluginDefinition = [IPluginContructor, Partial<PluginOptions>?];
	}

	class CalHeatmap {
		constructor();

		paint(
			options?: any,
			plugins?: CalHeatmap.PluginDefinition[] | CalHeatmap.PluginDefinition
		): Promise<unknown>;

		addTemplates(templates: CalHeatmap.Template | CalHeatmap.Template[]): void;

		next(n?: number): Promise<unknown>;

		previous(n?: number): Promise<unknown>;

		jumpTo(date: Date, reset?: boolean): Promise<unknown>;

		fill(dataSource?: any): Promise<unknown>;

		on(name: string, fn: () => any): void;

		dimensions(): CalHeatmap.Dimensions;

		destroy(): Promise<unknown>;

		extendDayjs(plugin: PluginFunc): dayjs.Dayjs;
	}

	export = CalHeatmap;
	export as namespace CalHeatmap;
}

declare module 'cal-heatmap/plugins/Legend' {
	import type CalHeatmap from 'cal-heatmap';

	class Legend implements CalHeatmap.IPlugin {
		name: string;
		calendar: CalHeatmap;
		options: CalHeatmap.LegendOptions;
		root: any;

		constructor(calendar: CalHeatmap);
		setup(options?: CalHeatmap.LegendOptions): void;
		paint(): Promise<unknown>;
		destroy(): Promise<unknown>;
	}

	export default Legend;
}

declare module 'cal-heatmap/plugins/Tooltip' {
	import type CalHeatmap from 'cal-heatmap';

	class Tooltip implements CalHeatmap.IPlugin {
		name: string;
		calendar: CalHeatmap;
		options: CalHeatmap.TooltipOptions;
		root: any;

		constructor(calendar: CalHeatmap);
		setup(options?: CalHeatmap.TooltipOptions): void;
		paint(): Promise<unknown>;
		destroy(): Promise<unknown>;
	}

	export default Tooltip;
}

declare module 'cal-heatmap/plugins/CalendarLabel' {
	import type CalHeatmap from 'cal-heatmap';

	class CalendarLabel implements CalHeatmap.IPlugin {
		name: string;
		calendar: CalHeatmap;
		options: CalHeatmap.CalendarLabelOptions;
		root: any;

		constructor(calendar: CalHeatmap);
		setup(options?: CalHeatmap.CalendarLabelOptions): void;
		paint(): Promise<unknown>;
		destroy(): Promise<unknown>;
	}

	export default CalendarLabel;
}

declare module 'cal-heatmap/plugins/LegendLite' {
	import type CalHeatmap from 'cal-heatmap';

	class LegendLite implements CalHeatmap.IPlugin {
		name: string;
		calendar: CalHeatmap;
		options: CalHeatmap.PluginOptions;
		root: any;

		constructor(calendar: CalHeatmap);
		setup(options?: CalHeatmap.PluginOptions): void;
		paint(): Promise<unknown>;
		destroy(): Promise<unknown>;
	}

	export default LegendLite;
}
