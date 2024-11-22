<script lang="ts">
	import { sitename, siteurl, siteimage } from '$lib'; // Import site-related variables
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';
	import { _currencies } from './+page';
	import Input from '$lib/components/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import type { UserContext } from '$lib/types';
	import { getContext } from 'svelte';

	export let data;

	let userData = $page.data.user?.userData;

	const { userUsername } = getContext<UserContext>('userContext');

	export let form: ActionData & FormActionData;
	let isLoading = false;
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
		const foundCurrency = currencyList.find((f) => f.value === currencyTo);
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

<section class="my-8 px-4 text-center">
	<h1 class="mb-4 text-4xl font-bold text-gray-800 dark:text-gray-200">
		Welcome
		<span class="text-green-600 dark:text-green-500">
			{userUsername || ''}
		</span>
		to the Currency Converter
	</h1>
	<p class="mb-4 text-lg text-gray-700 dark:text-gray-300">
		Convert currencies effortlessly. Just input the amount and currencies, and get your results
		instantly.
	</p>
</section>

<form use:enhance={handleSubmit} method="POST" class="space-y-4">
	<label
		for="currencyFrom"
		class="block text-center text-sm font-medium text-gray-700 dark:text-gray-300"
		>Select Currency to Convert From:</label
	>
	<div class="flex flex-row flex-wrap items-center justify-center space-y-3 sm:space-y-0">
		<Input
			type="text"
			list="currency-from"
			name="currencyFrom"
			id="currencyFrom"
			value={form?.currencyFrom ?? ''}
			required
			placeholder="Enter currency code (e.g., USD)"
			class="mt-1 h-fit w-fit max-w-fit border border-gray-300 p-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:text-gray-100 dark:focus:border-green-500 dark:focus:ring-green-500"
		/>

		<datalist id="currency-from">
			{#each currencyList as currency}
				<option label={currency.label} value={currency.value}></option>
			{/each}
		</datalist>
	</div>

	<label
		for="currencyTo"
		class="block text-center text-sm font-medium text-gray-700 dark:text-gray-300"
		>Select Currency to Convert To:</label
	>
	<div class="flex flex-row flex-wrap items-center justify-center space-y-3 sm:space-y-0">
		<Input
			type="text"
			list="currency-to"
			id="currencyTo"
			name="currencyTo"
			required
			value={form?.currencyTo ?? ''}
			placeholder="Enter currency code (e.g., EUR)"
			class="mt-1 h-fit w-fit max-w-fit border border-gray-300 p-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:text-gray-100 dark:focus:border-green-500 dark:focus:ring-green-500"
		/>

		<datalist id="currency-to">
			{#each currencyList as currency}
				<option label={currency.label} value={currency.value}></option>
			{/each}
		</datalist>
	</div>
	<div class="flex flex-col items-center justify-center">
		<label for="currencyAmount" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
			>Enter Amount to Convert:</label
		>
		<Input
			type="text"
			id="currencyAmount"
			name="currencyAmount"
			pattern="\d+(?:,\d+)*"
			on:change={(e) => formatNumberInput(e)}
			value={''}
			placeholder="Enter amount"
			required
			class="mt-1 block h-fit w-fit max-w-fit border border-gray-300 p-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:text-gray-100 dark:focus:border-green-500 dark:focus:ring-green-500"
		/>
	</div>
	<button
		type="submit"
		class="mx-auto mt-4 flex w-fit max-w-md items-center justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:border-red-600 dark:focus:ring-red-500"
	>
		{isLoading ? 'Converting...' : 'Convert Currency'}</button
	>
</form>

<div class:hidden={isLoading}>
	{#if form?.status === 200}
		<p class="mt-4 text-center text-lg text-green-600 dark:text-green-400">
			Conversion successful from <strong>{form?.currencyFrom}</strong>
			to
			<strong>{form?.currencyTo}</strong>.
			<br />
			Amount: <strong>{form?.currencyAmount.toLocaleString()}</strong>
			{getCurrencyLabel(form?.currencyFrom)}
			<br />
			Exchanged Amount: <strong>{form?.body?.rate}</strong>
			{getCurrencyLabel(form?.currencyTo)}.
		</p>
	{:else if form?.status === 500}
		<p class="mt-4 text-center text-lg text-red-600 dark:text-red-400">
			An error occurred: {form?.body?.error}
		</p>
	{/if}
</div>
