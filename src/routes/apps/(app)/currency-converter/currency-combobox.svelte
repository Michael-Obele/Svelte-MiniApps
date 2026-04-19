<script lang="ts">
	import { tick } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import * as Command from '@/ui/command';
	import * as Popover from '@/ui/popover';
	import { Button } from '@/ui/button';
	import { cn } from '$lib/utils';
	import type { CurrencyInfo } from '$lib/remote';

	interface Props {
		id: string;
		label: string;
		placeholder?: string;
		currencies: CurrencyInfo[];
		value?: string;
		onSelect?: (value: string) => void;
	}

	let {
		id,
		label,
		placeholder = 'Search currencies...',
		currencies,
		value = $bindable(''),
		onSelect
	}: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	let sortedCurrencies = $derived.by(() =>
		[...currencies].sort((left, right) => left.label.localeCompare(right.label))
	);

	let selectedCurrency = $derived(sortedCurrencies.find((currency) => currency.value === value));

	let buttonLabel = $derived(
		selectedCurrency
			? `${selectedCurrency.label} (${selectedCurrency.value} · ${selectedCurrency.symbol})`
			: placeholder
	);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function selectCurrency(currencyCode: string) {
		value = currencyCode;
		onSelect?.(currencyCode);
		closeAndFocusTrigger();
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				{id}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-full justify-between gap-3 overflow-hidden"
			>
				<span class="block min-w-0 truncate text-left">{buttonLabel}</span>
				<ChevronsUpDown class="size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[min(92vw,28rem)] p-0" align="start" sideOffset={8}>
		<Command.Root class="w-full" {label}>
			<Command.Input {placeholder} />
			<Command.List class="max-h-[18rem]">
				<Command.Empty class="text-muted-foreground px-4 py-6 text-sm">
					No currencies found. Try a name, code, or symbol.
				</Command.Empty>
				<Command.Group heading="All currencies">
					{#each sortedCurrencies as currency (currency.value)}
						<Command.Item
							value={currency.value}
							keywords={[currency.label, currency.value, currency.symbol]}
							onSelect={() => selectCurrency(currency.value)}
						>
							<Check
								class={cn('size-4 shrink-0', value !== currency.value && 'text-transparent')}
							/>
							<span class="flex min-w-0 flex-1 items-center justify-between gap-3">
								<span class="truncate">{currency.label}</span>
								<span class="text-muted-foreground shrink-0 text-xs">
									{currency.value} · {currency.symbol}
								</span>
							</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
