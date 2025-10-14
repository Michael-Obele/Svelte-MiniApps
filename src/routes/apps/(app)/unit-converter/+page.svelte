<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import {
		unitTypes,
		units,
		convertUnits,
		formatResult,
		getDefaultUnits,
		type UnitType
	} from './unit-data-convert.js';
	import { ArrowRightLeft, X, Eraser } from '@lucide/svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { unitConverterHowToUse } from './how-to-use-config';
	import { HelpCircle } from '@lucide/svelte';
	import { PersistedState } from 'runed';

	let inputValue: string = $state('');
	let fromUnit: string = $state('meter');
	let toUnit: string = $state('foot');
	let convertedValue: number | string = $state('');
	let unitType: string = $state('length');
	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState('unit-converter-has-seen-how-to-use', false);

	// Derived values for select trigger content
	let unitTypeLabel = $derived(
		unitTypes.find((t) => t.value === unitType)?.label ?? 'Select unit type'
	);
	let fromUnitLabel = $derived(
		units[unitType as UnitType].find((u) => u.value === fromUnit)?.label ?? 'Select from unit'
	);
	let toUnitLabel = $derived(
		units[unitType as UnitType].find((u) => u.value === toUnit)?.label ?? 'Select to unit'
	);

	let formattedInputValue = $derived.by(() => {
		const numValue = parseFloat(inputValue);
		if (isNaN(numValue)) {
			return '';
		}
		return new Intl.NumberFormat().format(numValue);
	});

	const getPluralUnitLabel = (label: string, value: number | string) => {
		const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
		if (parsedValue === 1) {
			return label.split('(')[0].trim();
		}
		// Simple pluralization: add 's' if not already ending in 's' or 'es'
		const baseLabel = label.split('(')[0].trim();
		if (baseLabel.endsWith('s') || baseLabel.endsWith('es')) {
			return baseLabel;
		}
		return baseLabel + 's';
	};

	const formattedFromUnitLabel = $derived(getPluralUnitLabel(fromUnitLabel, inputValue));
	const formattedToUnitLabel = $derived(getPluralUnitLabel(toUnitLabel, convertedValue));

	const convert = () => {
		const value = parseFloat(inputValue);
		if (isNaN(value)) {
			convertedValue = 'Invalid input';
			return;
		}

		if (fromUnit === toUnit) {
			convertedValue = value;
			return;
		}

		try {
			const result = convertUnits(value, fromUnit, toUnit);
			convertedValue = formatResult(result);
		} catch (error) {
			convertedValue = 'Unsupported conversion';
			console.error('Conversion error:', error);
		}
	};

	$effect(() => {
		if (inputValue && inputValue !== '') {
			convert();
		} else {
			convertedValue = '';
		}
	});

	const handleUnitTypeChange = (newType: string) => {
		unitType = newType;
		const defaultUnits = getDefaultUnits(unitType as UnitType);
		fromUnit = defaultUnits.from;
		toUnit = defaultUnits.to;
		if (inputValue && inputValue !== '') convert();
	};

	const handleFromUnitChange = (newUnit: string) => {
		fromUnit = newUnit;
		if (inputValue && inputValue !== '') convert();
	};

	const handleToUnitChange = (newUnit: string) => {
		toUnit = newUnit;
		if (inputValue && inputValue !== '') convert();
	};

	const swapUnits = () => {
		const temp = fromUnit;
		fromUnit = toUnit;
		toUnit = temp;
		if (inputValue && inputValue !== '') convert();
	};

	const clearInput = () => {
		inputValue = '';
		convertedValue = '';
	};
</script>

<svelte:head>
	<title>Unit Converter - Svelte MiniApps</title>
	<meta
		name="description"
		content="Convert between various units of measurement including length, temperature, volume, mass, area, time, angle, data, energy, force, power, and pressure."
	/>
</svelte:head>

<div class="container mx-auto max-w-4xl p-4">
	<div class="mb-8 text-center">
		<div class="mb-4 flex items-center justify-center gap-4">
			<h1 class="text-4xl font-bold tracking-tight">Unit Converter</h1>
			<Button variant="outline" size="icon" onclick={() => (showHowToUse = true)} class="shrink-0">
				<HelpCircle class="h-4 w-4" />
			</Button>
		</div>
		<p class="text-muted-foreground text-lg">
			Convert between various units of measurement with ease
		</p>
	</div>

	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>Select Unit Type</Card.Title>
			<Card.Description>Choose the category of units you want to convert</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				{#each unitTypes as type}
					<Button
						variant={unitType === type.value ? 'default' : 'outline'}
						class="h-12"
						onclick={() => handleUnitTypeChange(type.value)}
					>
						{type.label}
					</Button>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>Conversion</Card.Title>
			<Card.Description>Enter a value and select units to convert</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:gap-4">
				<div class="min-w-0 md:flex-2">
					<Label for="inputValue" class="mb-2 block text-sm font-medium">Value</Label>
					<div class="flex items-center gap-2">
						<Input
							id="inputValue"
							type="number"
							placeholder="Enter value"
							bind:value={inputValue}
							class="min-w-0 flex-1"
							step="any"
						/>
						<Button
							aria-label="Clear input"
							onclick={clearInput}
							class="h-10 w-10 shrink-0 border-red-500 bg-red-500 text-white shadow-md hover:border-red-700 hover:bg-red-700"
							title="Clear input"
						>
							<Eraser class="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div class="min-w-0 md:flex-1">
					<Label for="fromUnit" class="mb-2 block text-sm font-medium">From</Label>
					<Select.Root type="single" bind:value={fromUnit} onValueChange={handleFromUnitChange}>
						<Select.Trigger id="fromUnit" class="w-full min-w-0">
							<span class="block truncate">{fromUnitLabel}</span>
						</Select.Trigger>

						<Select.Content>
							{#each units[unitType as UnitType] as unit}
								<Select.Item value={unit.value} label={unit.label}>
									{unit.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="flex justify-center md:flex-none">
					<Button
						variant="outline"
						size="icon"
						onclick={swapUnits}
						class="h-10 w-10"
						aria-label="Swap units"
					>
						<ArrowRightLeft />
					</Button>
				</div>

				<div class="min-w-0 md:flex-1">
					<Label for="toUnit" class="mb-2 block text-sm font-medium">To</Label>
					<Select.Root type="single" bind:value={toUnit} onValueChange={handleToUnitChange}>
						<Select.Trigger id="toUnit" class="w-full min-w-0">
							<span class="block truncate">{toUnitLabel}</span>
						</Select.Trigger>
						<Select.Content>
							{#each units[unitType as UnitType] as unit}
								<Select.Item value={unit.value} label={unit.label}>
									{unit.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Result</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="bg-muted/50 rounded-lg p-6 text-center">
				{#if inputValue && convertedValue}
					<div class="space-y-2">
						<p class="text-muted-foreground text-sm">
							{formattedInputValue}
							{formattedFromUnitLabel} equals
						</p>
						<p class="text-primary text-3xl font-bold">
							{convertedValue}
						</p>
						<p class="text-muted-foreground text-sm">
							{formattedToUnitLabel}
						</p>
					</div>
				{:else if inputValue && !convertedValue}
					<p class="text-muted-foreground">Converting...</p>
				{:else}
					<p class="text-muted-foreground">Enter a value to see the conversion result</p>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<div class="text-muted-foreground mt-8 text-center text-sm">
		<p>
			Supports conversion between length, temperature, volume, mass, area, time, angle, data,
			energy, force, power, and pressure units.
		</p>
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={unitConverterHowToUse.title}
	description={unitConverterHowToUse.description}
	tabs={unitConverterHowToUse.tabs}
	showFooterHelpText={unitConverterHowToUse.showFooterHelpText}
/>
