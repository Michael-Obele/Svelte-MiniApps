<script lang="ts">
	import { site } from '$lib/index.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as Alert from '@/ui/alert/index.js';
	import { ArrowLeftRight, AlertCircle, Loader2, HelpCircle, RefreshCw } from 'lucide-svelte';
	import Input from '@/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import Switch from '@/ui/switch/switch.svelte';
	import Label from '@/ui/label/label.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { currencyConverterHowToUse } from './how-to-use-config';
	import { PersistedState } from 'runed';
	import { getCurrencies, convertCurrencyForm, type CurrencyInfo } from '$lib/remote';
	import * as Select from '@/ui/select/index.js';
	import { onMount } from 'svelte';

	let showHowToUseDialog = $state(false);

	// Track if user has seen the how-to guide
	let hasSeenGuide = new PersistedState<boolean>('currency-converter-has-seen-guide', false, {
		storage: 'local'
	});

	// Form state for UI (Select components need separate state)
	let fromCurrency = $state('USD');
	let toCurrency = $state('EUR');

	// Currencies state with full info
	let currencies = $state<CurrencyInfo[]>([]);
	let currenciesLoading = $state(true);

	// Load currencies on mount
	onMount(async () => {
		try {
			currencies = await getCurrencies();
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

	function getCurrencyLabel(currencyCode: string): string {
		const foundCurrency = getCurrencyData(currencyCode);
		return foundCurrency ? foundCurrency.label : currencyCode;
	}

	function getCurrencySymbol(currencyCode: string): string {
		const foundCurrency = getCurrencyData(currencyCode);
		return foundCurrency?.symbol || currencyCode;
	}

	function swapCurrencies() {
		const temp = fromCurrency;
		fromCurrency = toCurrency;
		toCurrency = temp;
		// Update form fields
		convertCurrencyForm.fields.from.set(fromCurrency);
		convertCurrencyForm.fields.to.set(toCurrency);
	}

	// Sync Select values with form fields
	$effect(() => {
		convertCurrencyForm.fields.from.set(fromCurrency);
	});

	$effect(() => {
		convertCurrencyForm.fields.to.set(toCurrency);
	});

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
				<form
					{...convertCurrencyForm.enhance(async ({ form, submit }) => {
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
					<!-- Hidden fields for from/to since we use Select components -->
					<input type="hidden" name="from" value={fromCurrency} />
					<input type="hidden" name="to" value={toCurrency} />

					<div class="grid gap-6 md:grid-cols-2">
						<!-- From Currency -->
						<div class="space-y-2">
							<label for="currencyFrom" class="text-sm font-medium">Convert From</label>
							{#if currenciesLoading}
								<div class="flex items-center space-x-2">
									<Loader2 class="h-4 w-4 animate-spin" />
									<span class="text-sm text-muted-foreground">Loading currencies...</span>
								</div>
							{:else}
								<Select.Root type="single" bind:value={fromCurrency}>
									<Select.Trigger class="w-full">
										<span class="flex items-center gap-2">
											<span class="font-medium">{fromCurrency}</span>
											<span class="text-muted-foreground">- {getCurrencyLabel(fromCurrency)}</span>
										</span>
									</Select.Trigger>
									<Select.Content class="max-h-[300px]">
										<Select.Group>
											<Select.GroupHeading>Currencies</Select.GroupHeading>
											{#each currencies as currency (currency.value)}
												<Select.Item value={currency.value}>
													<span class="flex items-center gap-2">
														<span class="font-medium">{currency.value}</span>
														<span class="text-muted-foreground">- {currency.label}</span>
														<span class="ml-auto text-muted-foreground">{currency.symbol}</span>
													</span>
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							{/if}
						</div>

						<!-- To Currency -->
						<div class="space-y-2">
							<label for="currencyTo" class="text-sm font-medium">Convert To</label>
							{#if currenciesLoading}
								<div class="flex items-center space-x-2">
									<Loader2 class="h-4 w-4 animate-spin" />
									<span class="text-sm text-muted-foreground">Loading currencies...</span>
								</div>
							{:else}
								<Select.Root type="single" bind:value={toCurrency}>
									<Select.Trigger class="w-full">
										<span class="flex items-center gap-2">
											<span class="font-medium">{toCurrency}</span>
											<span class="text-muted-foreground">- {getCurrencyLabel(toCurrency)}</span>
										</span>
									</Select.Trigger>
									<Select.Content class="max-h-[300px]">
										<Select.Group>
											<Select.GroupHeading>Currencies</Select.GroupHeading>
											{#each currencies as currency (currency.value)}
												<Select.Item value={currency.value}>
													<span class="flex items-center gap-2">
														<span class="font-medium">{currency.value}</span>
														<span class="text-muted-foreground">- {currency.label}</span>
														<span class="ml-auto text-muted-foreground">{currency.symbol}</span>
													</span>
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							{/if}
						</div>
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
						<label for="currencyAmount" class="text-sm font-medium">Amount</label>
						{#each convertCurrencyForm.fields.amount.issues() ?? [] as issue}
							<p class="text-sm text-destructive">{issue.message}</p>
						{/each}
						<Input
							{...convertCurrencyForm.fields.amount.as('number')}
							id="currencyAmount"
							placeholder="Enter amount"
							step="0.01"
							min="0.01"
							class="w-full"
						/>
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
							<AlertCircle class="h-4 w-4" />
							<Alert.Description>
								Please use Force Fresh Rate sparingly. The cache is only active for 8 minutes to
								ensure rate accuracy.
							</Alert.Description>
						</Alert.Root>
					{/if}

					<!-- Convert Button -->
					<Button type="submit" class="w-full" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Converting...
						{:else}
							<RefreshCw class="mr-2 h-4 w-4" />
							Convert Currency
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<!-- Results Card -->
		{#if result}
			<Card>
				<CardHeader>
					<CardTitle>Conversion Result</CardTitle>
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
							<div class="mt-2 text-3xl font-bold text-primary">
								{getCurrencySymbol(result.toCurrency)}
								{Number(result.convertedAmount).toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
								{result.toCurrency}
							</div>
						</div>

						<div class="rounded-lg bg-muted p-4">
							<div class="text-center text-sm text-muted-foreground">
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
