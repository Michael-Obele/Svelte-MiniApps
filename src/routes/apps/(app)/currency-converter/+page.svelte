<script lang="ts">
	import { site } from '$lib/index.svelte'; // Import site-related variables
	import { enhance } from '$app/forms';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import type { ActionData, SubmitFunction, PageData } from './$types';
	import * as Alert from '@/ui/alert/index.js';
	import { AlertCircle, ArrowLeftRight, HelpCircle } from '@lucide/svelte';
	import Input from '@/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import Switch from '@/ui/switch/switch.svelte';
	import Label from '@/ui/label/label.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
	import Loading from '@/blocks/Loading.svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { currencyConverterHowToUse } from './how-to-use-config';
	import { PersistedState } from 'runed';

	interface Props {
		data: PageData;
		form: ActionData & FormActionData;
	}

	let { data, form = $bindable() }: Props = $props();
	let isLoading = $state(false);
	let forceRefresh = $state(false);
	let showHowToUseDialog = $state(false);

	// Track if user has seen the how-to guide
	let hasSeenGuide = new PersistedState<boolean>('currency-converter-has-seen-guide', false, {
		storage: 'local'
	});

	interface FormActionData {
		status?: number;
		error?: string;
		currencyFrom?: string;
		currencyTo?: string;
		currencyAmount?: number;
		body?: {
			error?: string;
			rate: number;
			convertedAmount: number;
			cached?: boolean;
			cacheAge?: number;
		};
	}

	let currencyList = data.currencyList;

	// Start form submission process.
	const handleSubmit: SubmitFunction = () => {
		isLoading = true; // Indicate submission is in progress.
		toast.loading('Converting currencies...'); // Show loading toast.
		if (form) {
			form.status = 0;
		}

		return async ({ update, result }) => {
			await update(); // Wait for update to finish.
			isLoading = false; // Submission process ends.
			toast.dismiss(); // Dismiss loading toast.

			console.log('[Frontend] Form data after update:', form);
			console.log('[Frontend] Result after update:', result);

			// Check form status first as it represents the final state
			if (form?.status === 200) {
				toast.success('Successfully converted currencies');
			} else if (form?.error) {
				toast.error(form.error);
			}
		};
	};

	function getCurrencyLabel(currencyTo: string) {
		const foundCurrency = currencyList.find((f: { value: string }) => f.value === currencyTo);
		return foundCurrency ? foundCurrency.label : currencyTo; // Return label if found, else return the currency code
	}

	function formatNumberInput(e: Event) {
		const target = e.target as HTMLInputElement;

		// First, remove any non-numeric characters except dots and commas
		let value = target.value.replace(/[^\d.,]/g, '');

		// Replace multiple dots with a single dot and ensure only one decimal point
		value = value.replace(/\.+/g, '.');
		const parts = value.split('.');
		if (parts.length > 2) {
			value = parts[0] + '.' + parts.slice(1).join('');
		}

		// Remove commas and format with proper thousand separators
		value = value.replace(/,/g, '');
		if (value) {
			const [integerPart, decimalPart] = value.split('.');
			// Format integer part with thousand separators
			let formattedInteger = Number(integerPart).toLocaleString('en-US');

			// Add back decimal part if it exists
			value = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
		}

		// Update the input value
		target.value = value;
	}
</script>

<RouteHead
	title="Currency Converter - {site().name}"
	description="Convert currencies effortlessly with our easy-to-use currency converter. Get instant results and accurate exchange rates."
	keywords="currency converter, exchange rates, currency exchange, money converter, convert money"
	route="/apps/currency-converter"
	image={site().image}
/>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col items-start justify-between gap-4 sm:items-center md:flex-row">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Currency Converter</h1>
			<p class="mt-1 text-gray-600 dark:text-gray-400">
				Convert currencies with real-time exchange rates
			</p>
		</div>
		<Button variant="outline" onclick={() => (showHowToUseDialog = true)}>
			<HelpCircle class="mr-2 h-4 w-4" />
			How to Use
		</Button>
	</div>

	<!-- Main Content -->
	<div class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>Convert Currency</CardTitle>
			</CardHeader>
			<CardContent>
				<form use:enhance={handleSubmit} method="POST" class="space-y-6">
					<div class="grid gap-6 md:grid-cols-2">
						<!-- From Currency -->
						<div class="space-y-2">
							<label for="currencyFrom" class="text-sm font-medium">Convert From</label>
							<div class="relative">
								<Input
									type="text"
									list="currency-from"
									name="currencyFrom"
									id="currencyFrom"
									value={form?.currencyFrom ?? ''}
									required
									maxlength={3}
									placeholder="USD"
									class="w-full"
								/>
								<datalist id="currency-from">
									{#each currencyList as currency}
										<option label={currency.label} value={currency.value}></option>
									{/each}
								</datalist>
							</div>
						</div>

						<!-- To Currency -->
						<div class="space-y-2">
							<label for="currencyTo" class="text-sm font-medium">Convert To</label>
							<div class="relative">
								<Input
									type="text"
									list="currency-to"
									id="currencyTo"
									name="currencyTo"
									required
									maxlength={3}
									value={form?.currencyTo ?? ''}
									placeholder="EUR"
									class="w-full"
								/>
								<datalist id="currency-to">
									{#each currencyList as currency}
										<option label={currency.label} value={currency.value}></option>
									{/each}
								</datalist>
							</div>
						</div>
					</div>

					<!-- Swap Button -->
					<div class="flex justify-center">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => {
								const fromInput = document.getElementById('currencyFrom') as HTMLInputElement;
								const toInput = document.getElementById('currencyTo') as HTMLInputElement;
								const fromValue = fromInput.value;
								fromInput.value = toInput.value;
								toInput.value = fromValue;
							}}
							aria-label="Swap currencies"
						>
							<ArrowLeftRight class="h-4 w-4" />
						</Button>
					</div>

					<!-- Amount -->
					<div class="space-y-2">
						<label for="currencyAmount" class="text-sm font-medium">Amount</label>
						<Input
							type="text"
							name="currencyAmount"
							id="currencyAmount"
							required
							value={form?.currencyAmount ?? ''}
							placeholder="Enter amount"
							oninput={formatNumberInput}
							class="w-full"
						/>
					</div>

					<!-- Force Refresh Switch -->
					<div class="flex items-center space-x-2">
						<input type="hidden" name="forceRefresh" value={forceRefresh ? 'true' : 'false'} />
						<Switch bind:checked={forceRefresh} id="force-refresh" />
						<Label for="force-refresh" class="text-sm font-medium">Force Fresh Rate</Label>
					</div>

					{#if forceRefresh}
						<Alert.Root variant="destructive">
							<AlertCircle class="h-4 w-4" />
							<Alert.Description>
								Please use Force Fresh Rate sparingly. The cache is only active for 8 minutes to
								ensure rate accuracy.
							</Alert.Description>
						</Alert.Root>
					{/if}

					<!-- Convert Button -->
					<Button type="submit" class="w-full" disabled={isLoading}>
						{#if isLoading}
							<Loading class="mr-2 h-4 w-4" />
							Converting...
						{:else}
							Convert Currency
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<!-- Results Card -->
		{#if form?.status === 200 && form?.body?.convertedAmount !== undefined && form?.body?.rate !== undefined}
			<Card>
				<CardHeader>
					<CardTitle>Conversion Result</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">
								{Number(form?.currencyAmount || 0).toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
								{getCurrencyLabel(form?.currencyFrom)} =
							</div>
							<div class="text-primary text-3xl font-bold">
								{Number(form.body.convertedAmount).toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
								{getCurrencyLabel(form?.currencyTo)}
							</div>
						</div>

						<div class="bg-muted rounded-lg p-4">
							<div class="text-muted-foreground text-center text-sm">
								<div class="font-medium">
									Exchange Rate: 1 {getCurrencyLabel(form?.currencyFrom)} = {Number(
										form.body.rate
									).toLocaleString('en-US', {
										minimumFractionDigits: 4,
										maximumFractionDigits: 4
									})}
									{getCurrencyLabel(form?.currencyTo)}
								</div>
								{#if form?.body?.cached}
									<div class="mt-1 text-xs">
										Cached {form.body.cacheAge !== undefined
											? `${Math.floor(form.body.cacheAge / 60)}m ${form.body.cacheAge % 60}s ago`
											: 'just now'}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		{:else if form?.error}
			<Card class="border-destructive">
				<CardContent class="pt-6">
					<Alert.Root variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<Alert.Description>{form.error}</Alert.Description>
					</Alert.Root>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>

<!-- How to Use Dialog -->
<HowToUseDialog
	bind:open={showHowToUseDialog}
	onClose={() => (hasSeenGuide.current = true)}
	title={currencyConverterHowToUse.title}
	description={currencyConverterHowToUse.description}
	tabs={currencyConverterHowToUse.tabs}
	showFooterHelpText={currencyConverterHowToUse.showFooterHelpText}
/>
