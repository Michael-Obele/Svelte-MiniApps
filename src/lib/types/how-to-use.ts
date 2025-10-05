import type { Icon as IconType } from '@lucide/svelte';

export interface Step {
	number: number;
	title: string;
	description: string;
	color: string;
}

export interface Feature {
	icon: typeof IconType;
	title: string;
	description: string;
}

export interface StatusIndicator {
	variant: 'default' | 'secondary' | 'destructive' | 'outline';
	bgColor?: string;
	icon: typeof IconType;
	label: string;
	description: string;
}

export interface Tip {
	text: string;
}

export interface TabConfig {
	value: string;
	label: string;
	icon: typeof IconType;
	steps?: Step[];
	features?: Feature[];
	statusIndicators?: StatusIndicator[];
	tips?: Tip[];
	proTip?: {
		text: string;
		icon?: typeof IconType;
		borderColor?: string;
		bgColor?: string;
		iconColor?: string;
		textColor?: string;
		headingColor?: string;
	};
	optionalDetails?: {
		label: string;
		description: string;
	}[];
}

export interface HowToUseConfig {
	title: string;
	description: string;
	tabs: TabConfig[];
	showFooterHelpText?: boolean;
	storageKey: string;
}
