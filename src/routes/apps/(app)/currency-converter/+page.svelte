<script lang="ts">
	import { site } from '$lib/index.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as Alert from '@/ui/alert/index.js';
	import { ArrowLeftRight, Clock, Globe, History, HelpCircle, Loader } from '@lucide/svelte';
	import Input from '@/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import Switch from '@/ui/switch/switch.svelte';
	import Label from '@/ui/label/label.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { Separator } from '@/ui/separator';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { currencyConverterHowToUse } from './how-to-use-config';
	import { PersistedState } from '$lib/persisted-state';
	import { getCurrencies, convertCurrencyForm, type CurrencyInfo } from '$lib/remote';
	import { onMount } from 'svelte';
	import {
		currencySelection,
		normalizeCurrencyCode,
		rememberCurrencySelection,
		resetCurrencySelection
	} from './state.svelte';
	import CurrencyCombobox from './currency-combobox.svelte';

	let showHowToUseDialog = $state(false);
	const defaultFromCurrency = 'USD';
	const defaultToCurrency = 'EUR';

	// Track if user has seen the how-to guide
	let hasSeenGuide = new PersistedState<boolean>('currency-converter-has-seen-guide', false, {});

	// Amount state for formatted display
	let amountValue = $state<number>(0);

	// Currencies state with full info
	let currencies = $state<CurrencyInfo[]>([]);
	let currenciesLoading = $state(true);

	// Valid currency codes set for quick lookup
	let validCurrencyCodes = $derived(new Set(currencies.map((c) => c.value)));
	let recentPairs = $derived(currencySelection.current.recentPairs);

	// Check if a currency code is valid
	function isValidCurrency(code: string): boolean {
		return validCurrencyCodes.has(code);
	}

	function getDefaultTargetCurrency(fromCurrency: string): string {
		if (fromCurrency !== defaultToCurrency && isValidCurrency(defaultToCurrency)) {
			return defaultToCurrency;
		}

		if (fromCurrency !== defaultFromCurrency && isValidCurrency(defaultFromCurrency)) {
			return defaultFromCurrency;
		}

		return currencies.find((currency) => currency.value !== fromCurrency)?.value ?? fromCurrency;
	}

	function sanitizeStoredSelection() {
		if (currencies.length === 0) return;

		const normalizedFrom = normalizeCurrencyCode(currencySelection.current.fromCurrency);
		const normalizedTo = normalizeCurrencyCode(currencySelection.current.toCurrency);
		const nextFrom = isValidCurrency(normalizedFrom) ? normalizedFrom : defaultFromCurrency;
		const nextTo =
			isValidCurrency(normalizedTo) && normalizedTo !== nextFrom
				? normalizedTo
				: getDefaultTargetCurrency(nextFrom);

		if (
			nextFrom !== currencySelection.current.fromCurrency ||
			nextTo !== currencySelection.current.toCurrency
		) {
			currencySelection.current = {
				...currencySelection.current,
				fromCurrency: nextFrom,
				toCurrency: nextTo
			};
		}
	}

	// Derived validated currency codes (fallback to USD/EUR if invalid)
	let fromCurrency = $derived(
		isValidCurrency(normalizeCurrencyCode(currencySelection.current.fromCurrency))
			? normalizeCurrencyCode(currencySelection.current.fromCurrency)
			: defaultFromCurrency
	);
	let toCurrency = $derived(
		isValidCurrency(normalizeCurrencyCode(currencySelection.current.toCurrency))
			? normalizeCurrencyCode(currencySelection.current.toCurrency)
			: defaultToCurrency
	);

	// Formatted amount preview using Intl.NumberFormat
	let formattedAmount = $derived.by(() => {
		if (!amountValue || amountValue <= 0 || !isValidCurrency(fromCurrency)) {
			return '';
		}
		try {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: fromCurrency,
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(amountValue);
		} catch {
			return `${amountValue.toFixed(2)} ${fromCurrency}`;
		}
	});

	// Load currencies on mount
	onMount(async () => {
		try {
			currencies = await getCurrencies();
			sanitizeStoredSelection();
		} catch (error) {
			console.error('Failed to load currencies:', error);
			toast.error('Failed to load currencies');
		} finally {
			currenciesLoading = false;
		}
	});

	function getCurrencyData(currencyCode: string): CurrencyInfo | undefined {
		return currencies.find((c) => c.value === currencyCode);
	}

	function getCurrencySymbol(currencyCode: string): string {
		const foundCurrency = getCurrencyData(currencyCode);
		return foundCurrency?.symbol || currencyCode;
	}

	function persistCurrencySelection(nextFromCurrency: string, nextToCurrency: string) {
		rememberCurrencySelection(nextFromCurrency, nextToCurrency);
	}

	function swapCurrencies() {
		const nextFromCurrency = toCurrency;
		const nextToCurrency = fromCurrency;
		rememberCurrencySelection(nextFromCurrency, nextToCurrency);
	}

	function resetCurrencies() {
		resetCurrencySelection();
	}

	// Handle amount input change
	function handleAmountChange(e: Event) {
		const target = e.target as HTMLInputElement;
		amountValue = parseFloat(target.value) || 0;
	}

	// Track form state
	let isSubmitting = $derived(!!convertCurrencyForm.pending);
	let result = $derived(convertCurrencyForm.result);
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
	<div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div class="space-y-4">
			<div
				class="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.24em] uppercase"
			>
				<Globe class="size-3.5" />
				Stored in browser
			</div>
			<div>
				<h1 class="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
					Currency Converter
				</h1>
				<p class="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
					Convert currencies with real-time exchange rates and pick up right where you left off.
				</p>
			</div>
		</div>
		<Button variant="outline" onclick={() => (showHowToUseDialog = true)}>
			<HelpCircle class="mr-2 h-4 w-4" />
			How to Use
		</Button>
	</div>

	<!-- Main Content -->
	<div class="space-y-6">
		<Card class="border-border/60 overflow-hidden shadow-sm">
			<CardHeader class="space-y-4">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<CardTitle class="text-xl">Convert Currency</CardTitle>
						<p class="text-muted-foreground mt-1 text-sm">
							Your last currency pair is restored automatically.
						</p>
					</div>
					<Badge variant="secondary" class="w-fit gap-1.5">
						<History class="size-3.5" />
						Recently remembered
					</Badge>
				</div>
				<Separator />
			</CardHeader>
			<CardContent>
				<form
					{...convertCurrencyForm.enhance(async ({ submit }) => {
						try {
							await submit();
							if (convertCurrencyForm.result) {
								toast.success('Successfully converted currencies');
							}
						} catch (error) {
							console.error('Conversion error:', error);
							toast.error(
								error instanceof Error ? error.message : 'An error occurred during conversion'
							);
						}
					})}
					class="space-y-6"
				>
					<!-- Hidden fields for from/to with validated values -->
					<input type="hidden" name="from" value={fromCurrency} />
					<input type="hidden" name="to" value={toCurrency} />

					{#if currenciesLoading}
						<div
							class="border-border/60 bg-muted/20 text-muted-foreground flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm"
						>
							<Loader class="size-4 animate-spin" />
							Loading currencies...
						</div>
					{:else}
						<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-end">
							<!-- From Currency -->
							<div class="space-y-2">
								<Label for="currencyFrom" class="text-sm font-medium">Convert From</Label>
								<CurrencyCombobox
									id="currencyFrom"
									label="Convert From"
									currencies={currencies}
									bind:value={currencySelection.current.fromCurrency}
									onSelect={(value) => persistCurrencySelection(value, toCurrency)}
								/>
							</div>

							<div class="flex justify-center lg:pb-1">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onclick={swapCurrencies}
									aria-label="Swap currencies"
									class="rounded-full"
								>
									<ArrowLeftRight class="size-4" />
								</Button>
							</div>

							<!-- To Currency -->
							<div class="space-y-2">
								<Label for="currencyTo" class="text-sm font-medium">Convert To</Label>
								<CurrencyCombobox
									id="currencyTo"
									label="Convert To"
									currencies={currencies}
									bind:value={currencySelection.current.toCurrency}
									onSelect={(value) => persistCurrencySelection(fromCurrency, value)}
								/>
							</div>
						</div>

						<div class="border-border/60 bg-muted/20 rounded-2xl border border-dashed p-4">
							<div
								class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-[0.24em] uppercase"
							>
								<History class="size-3.5" />
								Recently remembered pairs
							</div>
							<div class="mt-3 flex flex-wrap gap-2">
								{#if recentPairs.length > 0}
									{#each recentPairs as pair (pair.fromCurrency + pair.toCurrency)}
										<Badge variant="secondary" class="gap-1.5">
											{pair.fromCurrency}
											<ArrowLeftRight class="size-3" />
											{pair.toCurrency}
										</Badge>
									{/each}
								{:else}
									<div class="text-muted-foreground flex items-center gap-2 text-sm">
										<Clock class="size-4" />
										No saved pairs yet. Your first selection will be remembered here.
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<div
						class="border-border/60 bg-muted/10 text-muted-foreground flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
					>
						<span>Need to start over?</span>
						<Button type="button" variant="ghost" size="sm" onclick={resetCurrencies}>
							Reset saved pair
						</Button>
					</div>

					<!-- Swap Button -->
					<div class="flex justify-center">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={swapCurrencies}
							aria-label="Swap currencies"
						>
							<ArrowLeftRight class="h-4 w-4" />
						</Button>
					</div>

					<!-- Amount -->
					<div class="space-y-2">
						<Label for="currencyAmount" class="text-sm font-medium">Amount</Label>
						{#each convertCurrencyForm.fields.amount.issues() ?? [] as issue, i (i)}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-1">
								<Input
									{...convertCurrencyForm.fields.amount.as('number')}
									id="currencyAmount"
									placeholder="Enter amount"
									step="0.01"
									min="0.01"
									class="w-full"
									oninput={handleAmountChange}
								/>
								<p class="text-muted-foreground text-xs">Enter the amount to convert</p>
							</div>
							<div class="space-y-1">
								<Input
									id="formattedAmount"
									type="text"
									value={formattedAmount || 'Enter an amount'}
									readonly
									disabled
									class="bg-muted w-full"
								/>
								<p class="text-muted-foreground text-xs">Formatted preview</p>
							</div>
						</div>
					</div>

					<!-- Force Refresh Switch -->
					<div class="flex items-center space-x-2">
						<input
							{...convertCurrencyForm.fields.forceRefresh.as('checkbox')}
							id="force-refresh"
							class="hidden"
						/>
						<Switch
							checked={convertCurrencyForm.fields.forceRefresh.value() ?? false}
							onCheckedChange={(checked) => convertCurrencyForm.fields.forceRefresh.set(checked)}
							id="force-refresh-switch"
						/>
						<Label for="force-refresh-switch" class="text-sm font-medium">Force Fresh Rate</Label>
					</div>

					{#if convertCurrencyForm.fields.forceRefresh.value()}
						<Alert.Root variant="destructive">
							<Alert.Description>
								Use Force Fresh Rate sparingly. The cache is only active for 8 minutes to ensure
								rate accuracy.
							</Alert.Description>
						</Alert.Root>
					{/if}

					<!-- Convert Button -->
					<Button type="submit" class="w-full" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader class="mr-2 size-4 animate-spin" />
							Converting...
						{:else}
							Convert Currency
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<!-- Results Card -->
		{#if result}
			<Card class="border-border/60 overflow-hidden shadow-sm">
				<CardHeader>
					<div class="flex items-center justify-between gap-3">
						<CardTitle>Conversion Result</CardTitle>
						<Badge variant="outline" class="gap-1.5">
							<Clock class="size-3.5" />
							{result.cached ? 'Cached rate' : 'Live rate'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">
								{getCurrencySymbol(result.fromCurrency)}
								{Number(result.originalAmount).toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
								{result.fromCurrency} =
							</div>
							<div class="text-primary mt-2 text-3xl font-bold">
								{getCurrencySymbol(result.toCurrency)}
								{Number(result.convertedAmount).toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
								{result.toCurrency}
							</div>
						</div>

						<div class="bg-muted rounded-lg p-4">
							<div class="text-muted-foreground text-center text-sm">
								<div class="font-medium">
									Exchange Rate: 1 {result.fromCurrency} = {Number(result.rate).toLocaleString(
										'en-US',
										{
											minimumFractionDigits: 4,
											maximumFractionDigits: 4
										}
									)}
									{result.toCurrency}
								</div>
								{#if result.cached}
									<div class="mt-1 text-xs">
										Cached {result.cacheAge !== undefined
											? `${Math.floor(result.cacheAge / 60)}m ${result.cacheAge % 60}s ago`
											: 'just now'}
									</div>
								{/if}
							</div>
						</div>
					</div>
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
