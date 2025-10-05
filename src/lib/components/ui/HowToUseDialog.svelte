<script lang="ts">
	import { HelpCircle, type Icon as IconType } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import * as Dialog from '@/ui/dialog';
	import * as Tabs from '@/ui/tabs';
	import { Badge } from '@/ui/badge';

	interface Step {
		number: number;
		title: string;
		description: string;
		color: string;
	}

	interface Feature {
		icon: typeof IconType;
		title: string;
		description: string;
	}

	interface StatusIndicator {
		variant: 'default' | 'secondary' | 'destructive' | 'outline';
		bgColor?: string;
		icon: typeof IconType;
		label: string;
		description: string;
	}

	interface Tip {
		text: string;
	}

	interface TabConfig {
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

	interface Props {
		open?: boolean;
		onClose?: () => void;
		title?: string;
		description?: string;
		tabs: TabConfig[];
		showFooterHelpText?: boolean;
	}

	let {
		open = $bindable(false),
		onClose,
		title = 'Quick Guide',
		description = 'Simple steps to get started',
		tabs,
		showFooterHelpText = false
	}: Props = $props();

	let activeTab = $state(tabs[0]?.value || '');

	// Ensure activeTab is valid when tabs change
	$effect(() => {
		if (!tabs.find((tab) => tab.value === activeTab)) {
			activeTab = tabs[0]?.value || '';
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto sm:max-w-[650px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<HelpCircle class="h-5 w-5" />
				{title}
			</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root bind:value={activeTab} class="py-4">
			<Tabs.List
				class="grid w-full gap-2"
				style="grid-template-columns: repeat({tabs.length}, 1fr)"
			>
				{#each tabs as tab}
					<Tabs.Trigger value={tab.value} class="flex items-center justify-center gap-1.5">
						<tab.icon class="h-4 w-4" />
						<span class="hidden sm:inline">{tab.label}</span>
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			{#each tabs as tab}
				<Tabs.Content value={tab.value} class="space-y-5 pt-5">
					<!-- Steps Section -->
					{#if tab.steps && tab.steps.length > 0}
						<div class="space-y-4">
							{#each tab.steps as step}
								<div class="flex gap-3">
									<div
										class="flex size-8 flex-shrink-0 items-center justify-center rounded-full font-semibold {step.color}"
									>
										{step.number}
									</div>
									<div class="min-w-0 flex-1">
										<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">{step.title}</h4>
										<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
											{@html step.description}
										</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Optional Details Section -->
					{#if tab.optionalDetails && tab.optionalDetails.length > 0}
						<div class="space-y-2">
							<h4 class="font-semibold text-gray-900 dark:text-white">Optional Details:</h4>
							<div class="grid gap-2 text-sm">
								{#each tab.optionalDetails as detail}
									<div class="flex items-center gap-2">
										<Badge variant="outline" class="font-normal">{detail.label}</Badge>
										<span class="text-gray-600 dark:text-gray-400">{detail.description}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Status Indicators Section -->
					{#if tab.statusIndicators && tab.statusIndicators.length > 0}
						<div
							class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
						>
							<h4 class="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
								{#if tab.icon}
									<tab.icon class="h-4 w-4" />
								{/if}
								Status Indicators
							</h4>
							<div class="grid gap-3">
								{#each tab.statusIndicators as indicator}
									<div class="flex items-start gap-3">
										<Badge variant={indicator.variant} class={indicator.bgColor || ''}>
											<indicator.icon class="mr-1 h-3 w-3" />
											{indicator.label}
										</Badge>
										<span class="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
											{indicator.description}
										</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Features Section -->
					{#if tab.features && tab.features.length > 0}
						<div class="space-y-3">
							{#each tab.features as feature}
								<div
									class="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
								>
									<h4
										class="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white"
									>
										<feature.icon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
										{feature.title}
									</h4>
									<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
										{@html feature.description}
									</p>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Pro Tip Section -->
					{#if tab.proTip}
						<div
							class="rounded-lg {tab.proTip.borderColor ||
								'border-blue-200 dark:border-blue-800'} border {tab.proTip.bgColor ||
								'bg-blue-50 dark:bg-blue-950/50'} p-4"
						>
							<div class="flex gap-2">
								{#if tab.proTip.icon}
									<tab.proTip.icon
										class="mt-0.5 h-4 w-4 flex-shrink-0 {tab.proTip.iconColor ||
											'text-blue-600 dark:text-blue-400'}"
									/>
								{/if}
								<div>
									<p
										class="font-semibold {tab.proTip.headingColor ||
											'text-blue-900 dark:text-blue-300'}"
									>
										Pro tip:
									</p>
									<p
										class="mt-1 text-sm {tab.proTip.textColor ||
											'text-blue-800 dark:text-blue-200'}"
									>
										{tab.proTip.text}
									</p>
								</div>
							</div>
						</div>
					{/if}

					<!-- Tips Section -->
					{#if tab.tips && tab.tips.length > 0}
						<div
							class="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/50"
						>
							<h4
								class="mb-3 flex items-center gap-2 font-semibold text-purple-900 dark:text-purple-300"
							>
								{#if tab.icon}
									<tab.icon class="h-4 w-4" />
								{/if}
								Quick Tips:
							</h4>
							<ul class="space-y-2">
								{#each tab.tips as tip}
									<li class="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-200">
										<span class="mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
										<span class="leading-relaxed">{tip.text}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</Tabs.Content>
			{/each}
		</Tabs.Root>

		<Dialog.Footer
			class="{showFooterHelpText
				? 'justify-between'
				: ''} flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700"
		>
			{#if showFooterHelpText}
				<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
					<HelpCircle class="h-3 w-3" />
					<span>Need help? Reopen this guide anytime from the header</span>
				</div>
			{/if}
			<Button
				variant="outline"
				onclick={() => {
					open = false;
					onClose?.();
				}}
				class={showFooterHelpText ? 'ml-auto' : ''}
			>
				Got It!
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
