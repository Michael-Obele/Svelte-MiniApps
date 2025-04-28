<script lang="ts">
	import { site } from '$lib'; // Import site-related variables
	import { enhance } from '$app/forms';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import type { ActionData, SubmitFunction, PageData } from './$types';
	import * as Alert from '@/ui/alert/index.js';
	import { AlertCircle, ArrowLeftRight } from 'lucide-svelte';
	import Input from '@/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import Switch from '@/ui/switch/switch.svelte';
	import Label from '@/ui/label/label.svelte';
	import { Button } from '@/ui/button';
	import Loading from '@/blocks/Loading.svelte';

	interface Props {
		data: PageData;
		form: ActionData & FormActionData;
	}

	let { data, form = $bindable() }: Props = $props();
	let isLoading = $state(false);
	let forceRefresh = $state(false);

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
	title="Currency Converter - {site.name}"
	description="Convert currencies effortlessly with our easy-to-use currency converter. Get instant results and accurate exchange rates."
	keywords="currency converter, exchange rates, currency exchange, money converter, convert money"
	route="/apps/currency-converter"
	image={site.image}
/>

<main class="w-full py-5 md:py-8 lg:py-10">
	<div class="px-4 xl:container md:px-6">
		<section
			class="mx-auto max-w-screen-xl justify-center rounded-md bg-white px-4 py-8 dark:bg-gray-900 lg:py-16 xl:rounded-lg"
		>
			<div class="mx-auto max-w-2xl">
				<div class="flex flex-col items-center justify-center space-y-4 text-center">
					<div class="space-y-2">
						<h1
							class="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-5xl"
						>
							Currency <span class="text-[#F03E3E] dark:text-[#FA5252]">Converter</span>
						</h1>
						<p class="mb-8 max-w-[600px] text-base text-gray-600 dark:text-gray-400 md:text-lg">
							Convert currencies effortlessly. Just input the amount and currencies, and get your
							results instantly.
						</p>
					</div>
				</div>

				<form use:enhance={handleSubmit} method="POST" class="my-6 flex flex-col space-y-8">
					<div class="flex flex-col items-center gap-6">
						<div class="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center">
							<!-- From Currency -->
							<div class="w-full max-w-[160px] space-y-2">
								<label
									for="currencyFrom"
									class="block text-center text-sm font-medium text-gray-700 dark:text-gray-300"
									>Convert From</label
								>
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
										class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center uppercase text-gray-900 shadow-sm transition-colors focus:border-[#F03E3E] focus:ring-2 focus:ring-[#F03E3E] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#FA5252] dark:focus:ring-[#FA5252]"
									/>
									<datalist id="currency-from">
										{#each currencyList as currency}
											<option label={currency.label} value={currency.value}></option>
										{/each}
									</datalist>
								</div>
							</div>

							<!-- Swap Button -->
							<Button
								type="button"
								class="mt-0 h-10 w-10 rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 sm:mt-5"
								onclick={() => {
									const fromInput = document.getElementById('currencyFrom') as HTMLInputElement;
									const toInput = document.getElementById('currencyTo') as HTMLInputElement;
									const fromValue = fromInput.value;
									fromInput.value = toInput.value;
									toInput.value = fromValue;
								}}
								aria-label="Swap currencies"
							>
								<ArrowLeftRight class="h-5 w-5" />
							</Button>

							<!-- To Currency -->
							<div class="w-full max-w-[160px] space-y-2">
								<label
									for="currencyTo"
									class="block text-center text-sm font-medium text-gray-700 dark:text-gray-300"
									>Convert To</label
								>
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
										class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center uppercase text-gray-900 shadow-sm transition-colors focus:border-[#F03E3E] focus:ring-2 focus:ring-[#F03E3E] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#FA5252] dark:focus:ring-[#FA5252]"
									/>
									<datalist id="currency-to">
										{#each currencyList as currency}
											<option label={currency.label} value={currency.value}></option>
										{/each}
									</datalist>
								</div>
							</div>
						</div>

						<!-- Amount -->
						<div class="w-full max-w-[300px] space-y-2">
							<label
								for="currencyAmount"
								class="block text-center text-sm font-medium text-gray-700 dark:text-gray-300"
								>Amount</label
							>
							<Input
								type="text"
								name="currencyAmount"
								id="currencyAmount"
								required
								value={form?.currencyAmount ?? ''}
								placeholder="Enter amount"
								oninput={formatNumberInput}
								class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-gray-900 shadow-sm transition-colors focus:border-[#F03E3E] focus:ring-2 focus:ring-[#F03E3E] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#FA5252] dark:focus:ring-[#FA5252]"
							/>
						</div>

						<!-- Force Refresh Switch -->
						<div class="flex items-center space-x-2">
							<input type="hidden" name="forceRefresh" value={forceRefresh ? 'true' : 'false'} />
							<div class="flex items-center space-x-2">
								<Switch bind:checked={forceRefresh} id="force-refresh" />
								<Label
									for="force-refresh"
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Force Fresh Rate
								</Label>
							</div>
						</div>
						<Alert.Root variant="destructive" class="mt-2 max-w-lg {forceRefresh ? '' : 'hidden'}">
							<AlertCircle class="h-4 w-4" />
							<Alert.Description>
								Please use Force Fresh Rate sparingly. The cache is only active for 8 minutes to
								ensure rate accuracy.
							</Alert.Description>
						</Alert.Root>
					</div>

					<button
						type="submit"
						class="mx-auto inline-flex w-fit items-center justify-center rounded-lg border border-transparent bg-[#F03E3E] px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-[#e03b3b] focus:outline-none focus:ring-2 focus:ring-[#F03E3E] focus:ring-offset-2"
					>
						{#if isLoading}
							<Loading class="fill-white-600 mr-3 h-5 w-5 animate-spin text-white" />
							Converting...
						{:else}
							Convert
						{/if}
					</button>
				</form>

				{#if form?.status === 200 && form?.body?.convertedAmount !== undefined && form?.body?.rate !== undefined}
					<div class="mt-8 rounded-lg bg-gray-50 p-6 shadow-sm dark:bg-gray-800/50">
						<div class="space-y-3 text-center">
							<div class="flex flex-col items-center justify-center space-y-2">
								<p class="text-lg font-medium text-gray-900 dark:text-white">
									{Number(form?.currencyAmount || 0).toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})}
									{getCurrencyLabel(form?.currencyFrom)} = {Number(
										form.body.convertedAmount
									).toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})}
									{getCurrencyLabel(form?.currencyTo)}
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									1 {getCurrencyLabel(form?.currencyFrom)} = {Number(form.body.rate).toLocaleString(
										'en-US',
										{
											minimumFractionDigits: 4,
											maximumFractionDigits: 4
										}
									)}
									{getCurrencyLabel(form?.currencyTo)}
									{#if form?.body?.cached}
										<span class="ml-2 text-xs text-gray-500">
											(Cached {form.body.cacheAge !== undefined
												? `${Math.floor(form.body.cacheAge / 60)}m ${form.body.cacheAge % 60}s ago`
												: 'just now'})
										</span>
									{/if}
								</p>
							</div>
						</div>
					</div>
				{:else if form?.error}
					<div class="mt-8 rounded-lg bg-red-50 p-6 shadow-sm dark:bg-red-900/20">
						<div class="flex items-center justify-center gap-2 text-red-700 dark:text-red-400">
							<AlertCircle class="h-5 w-5" />
							<p>{form.error}</p>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>
