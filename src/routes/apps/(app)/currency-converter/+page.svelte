<script lang="ts">
	import { sitename, siteurl, siteimage } from '$lib'; // Import site-related variables
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';
	import { _currencies } from './+page';
	import Input from '$lib/components/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';



	interface Props {
		data: any;
		form: ActionData & FormActionData;
	}

	let { data, form = $bindable() }: Props = $props();
	let isLoading = $state(false);
	interface FormActionData {
		status?: number;
		body?: {
			error?: string;
			rate?: string;
		};
	}
	let currencyList = data.currencyList;

	// Start form submission process.
	const handleSubmit: SubmitFunction = () => {
		isLoading = true; // Indicate submission is in progress.
		toast.loading('Submitting...'); // Show loading toast.
		if (form) {
			form.status = 0;
		}

		return async ({ update, result }) => {
			if (result.type === 'failure') {
				toast.dismiss(); // Dismiss all toasts.
				toast.error('Error'); // Show error toast.
			} else {
				toast.dismiss(); // Dismiss all toasts.
				toast.success('Success', {
					action: {
						label: 'OK',
						onClick: () => toast.dismiss()
					}
				}); // Show success toast.
			}

			await update(); // Wait for update to finish.
			isLoading = false; // Submission process ends.
		};
	};

	function getCurrencyLabel(currencyTo: string) {
		const foundCurrency = currencyList.find((f: { value: string; }) => f.value === currencyTo);
		return foundCurrency ? foundCurrency.label : currencyTo; // Return label if found, else return the currency code
	}

	function formatNumberInput(e: Event) {
		const target = e.target as HTMLInputElement; // Type assertion for e.target

		// Get the input value and remove any existing commas
		let value = target.value.replace(/,/g, '');

		// Format the number with commas as thousands separators
		value = Number(value).toLocaleString();

		// Update the input value with the formatted number
		target.value = value;
	}
</script>

<svelte:head>
	<title>Currency Converter - {sitename}</title>
	<meta
		name="description"
		content="Convert currencies effortlessly with our easy-to-use currency converter. Get instant results and accurate exchange rates."
	/>
	<meta
		name="keywords"
		content="currency converter, exchange rates, currency exchange, money converter, convert money"
	/>

	<!-- Open Graph Meta Tags -->
	<meta property="og:title" content="Currency Converter - {sitename}" />
	<meta
		property="og:description"
		content="Convert currencies easily and quickly with our free online tool."
	/>
	<meta property="og:image" content={siteimage} />
	<meta property="og:url" content="{siteurl}apps/currency-converter" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={sitename} />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Currency Converter - {sitename}" />
	<meta
		name="twitter:description"
		content="Convert currencies easily and quickly with our free online tool."
	/>
	<meta name="twitter:image" content={siteimage} />
	<meta name="twitter:site" content="@yourtwitterhandle" />
	<!-- Optional -->
	<meta name="twitter:creator" content="@yourtwitterhandle" />
	<!-- Optional -->

	<!-- Canonical URL -->
	<link rel="canonical" href="{siteurl}apps/currency-converter" />

	<!-- Other optional meta tags -->
	<meta name="robots" content="index, follow" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta charSet="UTF-8" />
</svelte:head>

<main class="w-full py-5 md:py-8 lg:py-10">
	<div class="px-4 xl:container md:px-6">
		<section class="mx-auto max-w-screen-xl justify-center rounded-md bg-white px-4 py-8 dark:bg-gray-900 lg:py-16 xl:rounded-lg">
			<div class="mx-auto max-w-2xl">
				<div class="flex flex-col items-center justify-center space-y-4 text-center">
					<div class="space-y-2">
						<h1 class="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
							Currency <span class="text-[#F03E3E] dark:text-[#FA5252]">Converter</span>
						</h1>
						<p class="mb-8 max-w-[600px] text-base text-gray-600 dark:text-gray-400 md:text-lg">
							Convert currencies effortlessly. Just input the amount and currencies, and get your results
							instantly.
						</p>
					</div>
				</div>

				<form use:enhance={handleSubmit} method="POST" class="flex flex-col space-y-8">
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
						<div class="w-full max-w-[200px] space-y-2">
							<label
								for="currencyAmount"
								class="block text-center text-sm font-medium text-gray-700 dark:text-gray-300"
								>Amount</label
							>
							<Input
								type="text"
								id="currencyAmount"
								name="currencyAmount"
								pattern="[0-9]*\.?[0-9]*"
								onchange={(e) => formatNumberInput(e)}
								value={''}
								placeholder="Enter amount"
								required
								class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-gray-900 shadow-sm transition-colors focus:border-[#F03E3E] focus:ring-2 focus:ring-[#F03E3E] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#FA5252] dark:focus:ring-[#FA5252]"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="group relative mx-auto w-fit overflow-hidden rounded-xl bg-gradient-to-br from-[#F03E3E] to-[#E03131] px-8 py-3 text-center text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#E03131] hover:to-[#C92A2A] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#F03E3E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:from-[#FA5252] dark:to-[#F03E3E] dark:hover:from-[#F03E3E] dark:hover:to-[#E03131]"
					>
						<span class="relative z-10 flex items-center justify-center gap-2">
							{#if isLoading}
								<span class="inline-flex items-center gap-2">
									<span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent shadow-sm"></span>
									Converting...
								</span>
							{:else}
								<span class="transform transition-transform duration-300 group-hover:scale-105">
									Convert Currency
								</span>
							{/if}
						</span>
						<div class="absolute inset-0 -z-10 bg-gradient-to-tr from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
					</button>
				</form>

				<!-- Result Section -->
				{#if form?.status === 200}
					<div class="mt-8 rounded-lg bg-gray-50 p-6 shadow-sm dark:bg-gray-800/50">
						<div class="space-y-3 text-center">
							<p class="text-lg font-medium text-[#F03E3E] dark:text-[#FA5252]">
								Conversion Result
							</p>
							<div class="space-y-2">
								<p class="text-gray-700 dark:text-gray-300">
									<span class="font-medium">{form?.currencyAmount.toLocaleString()}</span>
									<span class="ml-1">{getCurrencyLabel(form?.currencyFrom)}</span>
								</p>
								<p class="text-2xl font-bold text-[#F03E3E] dark:text-[#FA5252]">
									<span>{form?.body?.rate}</span>
									<span class="ml-1">{getCurrencyLabel(form?.currencyTo)}</span>
								</p>
							</div>
						</div>
					</div>
				{:else if form?.status === 500}
					<div class="mt-8 rounded-lg bg-red-50 p-6 text-center shadow-sm dark:bg-red-900/10">
						<p class="text-sm text-red-600 dark:text-red-400">
							An error occurred: {form?.body?.error}
						</p>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>
