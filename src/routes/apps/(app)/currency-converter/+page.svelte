<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { site } from '#lib/index.svelte.js';
	import RouteHead from '#lib/components/blocks/RouteHead.svelte';
	import * as Alert from '@/ui/alert/index.js';
	import { ArrowLeftRight, Clock, Globe, History, HelpCircle, Loader } from '@lucide/svelte';
	import Input from '@/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import Switch from '@/ui/switch/switch.svelte';
	import Label from '@/ui/label/label.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
	import { Badge, badgeVariants } from '@/ui/badge';
	import { Separator } from '@/ui/separator';
	import HowToUseDialog from '@/blocks/HowToUseDialog.svelte';
	import { currencyConverterHowToUse } from './how-to-use-config';
	import { PersistedState } from '#lib/persisted-state/index.js';
	import { getCurrencies, convertCurrencyForm, type CurrencyInfo } from '#lib/remote/index.js';
	import { onMount } from 'svelte';
	import {
		currencySelection,
		normalizeCurrencyCode,
		rememberCurrencySelection,
		resetCurrencySelection
	} from './state.svelte';
	import CurrencyCombobox from './currency-combobox.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let showHowToUseDialog = $state(false);
	const defaultFromCurrency = 'USD';
	const defaultToCurrency = 'EUR';

	// The URL is the source of truth for from/to/amount, so a shared link restores the whole view.
	// ponytail: written by hand because runed's useSearchParams still passes goto's removed
	// `noScroll`/`keepFocus`, which SvelteKit 3 rejects, so every one of its URL writes no-ops.
	const urlParams = $derived(page.url.searchParams);
	const rawFrom = $derived(urlParams.get('from') ?? '');
	const rawTo = $derived(urlParams.get('to') ?? '');
	const rawAmount = $derived(urlParams.get('amount') ?? '');

	// Amount from the URL, ignored unless it is a usable positive number
	const amountParam = $derived.by(() => {
		const amount = Number(rawAmount);
		return amount > 0 && amount <= 999999999 ? amount : 0;
	});

	/** Write from/to/amount to the URL. A value of 0 or '' removes the key. */
	async function setUrlParams(next: { from?: string; to?: string; amount?: number }) {
		const url = new URL(page.url.href);
		for (const [key, value] of Object.entries(next)) {
			if (value === undefined || value === null || value === '' || value === 0) {
				url.searchParams.delete(key);
			} else {
				url.searchParams.set(key, String(value));
			}
		}
		// reset: false is Kit 3's replacement for the old noScroll/keepFocus pair
		try {
			return await goto(url, { replace: true, reset: false });
		} catch (error) {
			console.error('Failed to update the URL', error);
		}
	}

	// Track if user has seen the how-to guide
	let hasSeenGuide = new PersistedState<boolean>('currency-converter-has-seen-guide', false, {});

	// Amount for formatted preview — derived from form field so preview updates while typing
	let amountValue = $derived(
		(convertCurrencyForm.fields.amount.value() as number | undefined) ?? 0
	);

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

	/** Rewrite params that are missing, invalid or stale so the URL always describes the view. */
	function sanitizeUrlParams() {
		if (currencies.length === 0) return;

		const nextAmount = amountParam > 0 ? String(amountParam) : '';
		if (rawFrom !== fromCurrency || rawTo !== toCurrency || rawAmount !== nextAmount) {
			setUrlParams({ from: fromCurrency, to: toCurrency, amount: amountParam });
		}
	}

	function selectRecentPair(pair: { fromCurrency: string; toCurrency: string }) {
		setUrlParams({
			from: normalizeCurrencyCode(pair.fromCurrency),
			to: normalizeCurrencyCode(pair.toCurrency)
		});
		rememberCurrencySelection(pair.fromCurrency, pair.toCurrency);
	}

	// Derived validated currency codes from URL params (fallback to defaults if invalid)
	let fromCurrency = $derived(
		isValidCurrency(normalizeCurrencyCode(rawFrom))
			? normalizeCurrencyCode(rawFrom)
			: defaultFromCurrency
	);
	let toCurrency = $derived(
		isValidCurrency(normalizeCurrencyCode(rawTo)) && normalizeCurrencyCode(rawTo) !== fromCurrency
			? normalizeCurrencyCode(rawTo)
			: getDefaultTargetCurrency(fromCurrency)
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
			sanitizeUrlParams();
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
		setUrlParams({
			from: normalizeCurrencyCode(nextFromCurrency),
			to: normalizeCurrencyCode(nextToCurrency)
		});
		rememberCurrencySelection(nextFromCurrency, nextToCurrency);
	}

	function swapCurrencies() {
		const nextFromCurrency = toCurrency;
		const nextToCurrency = fromCurrency;
		setUrlParams({
			from: normalizeCurrencyCode(nextFromCurrency),
			to: normalizeCurrencyCode(nextToCurrency)
		});
		rememberCurrencySelection(nextFromCurrency, nextToCurrency);
	}

	function resetCurrencies() {
		setUrlParams({ from: defaultFromCurrency, to: defaultToCurrency, amount: 0 });
		resetCurrencySelection();
		convertCurrencyForm.fields.amount.set(0);
	}

	function handleAmountInput(e: Event) {
		const target = e.target as HTMLInputElement;
		convertCurrencyForm.fields.amount.set(target.valueAsNumber || 0);
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
					{...convertCurrencyForm.enhance(async (form) => {
						try {
							if (!(await form.submit())) return; // invalid input: keep the URL as it was

							// Put the converted amount in the URL so the result is shareable and reloadable
							const amountToSync = Number(form.fields.amount.value() ?? 0);
							if (amountToSync > 0) setUrlParams({ amount: amountToSync });

							toast.success('Successfully converted currencies');
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
					<input {...convertCurrencyForm.fields.from.as('hidden', fromCurrency)} />
					<input {...convertCurrencyForm.fields.to.as('hidden', toCurrency)} />

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
									{currencies}
									value={fromCurrency}
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
									{currencies}
									value={toCurrency}
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
										<button
											type="button"
											onclick={() => selectRecentPair(pair)}
											class={cn(
												badgeVariants({ variant: 'secondary' }),
												'cursor-pointer gap-1.5 hover:opacity-80'
											)}
										>
											{pair.fromCurrency}
											<ArrowLeftRight class="size-3" />
											{pair.toCurrency}
										</button>
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
									{...convertCurrencyForm.fields.amount.as(
										'number',
										amountParam ? amountParam : undefined
									)}
									id="currencyAmount"
									placeholder="Enter amount"
									step="0.01"
									min="0.01"
									class="w-full"
									oninput={handleAmountInput}
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
