import { form, query } from '$app/server';
import * as v from 'valibot';
import { Convert, Converter } from 'easy-currencies';

// Types
interface ConversionResult {
	success: boolean;
	rate?: string;
	convertedAmount?: string;
	error?: string;
}

export interface CurrencyInfo {
	value: string;
	label: string;
	symbol: string;
}

// Validation constants
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;
const MAX_AMOUNT = 999999999;

// Cache configuration
const CACHE_DURATION = 8 * 60 * 1000; // 8 minutes in milliseconds
const rateCache = new Map<string, { rate: string; timestamp: number }>();

function getCacheKey(from: string, to: string): string {
	return `${from}-${to}`;
}

// Use built-in Intl APIs for currency data - no npm packages needed!
const currencyDisplayNames = new Intl.DisplayNames(['en'], { type: 'currency' });

/**
 * Get currency name using built-in Intl.DisplayNames API
 */
function getCurrencyName(code: string): string {
	try {
		return currencyDisplayNames.of(code) || code;
	} catch {
		return code;
	}
}

/**
 * Get currency symbol using built-in Intl.NumberFormat API
 */
function getCurrencySymbol(code: string): string {
	try {
		const formatted = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: code,
			currencyDisplay: 'narrowSymbol'
		}).format(0);
		// Extract symbol by removing the number and whitespace
		return formatted.replace(/[\d.,\s]/g, '').trim() || code;
	} catch {
		return code;
	}
}

/**
 * Get all world currencies using built-in Intl APIs
 * No npm packages needed - pure JavaScript!
 */
function getWorldCurrencies(): CurrencyInfo[] {
	try {
		// Get all ISO 4217 currency codes from built-in Intl API
		const allCurrencyCodes = Intl.supportedValuesOf('currency');

		// Build currency list with names and symbols
		return allCurrencyCodes.map((code) => ({
			value: code,
			label: getCurrencyName(code),
			symbol: getCurrencySymbol(code)
		}));
	} catch (error) {
		console.error('Error loading currencies from Intl API:', error);
		// Return a minimal fallback list
		return [
			{ value: 'USD', label: 'US Dollar', symbol: '$' },
			{ value: 'EUR', label: 'Euro', symbol: '€' },
			{ value: 'GBP', label: 'British Pound', symbol: '£' },
			{ value: 'JPY', label: 'Japanese Yen', symbol: '¥' }
		];
	}
}

// Get all currencies once (cached in memory)
const WORLD_CURRENCIES = getWorldCurrencies();

/**
 * Converts currency using the easy-currencies library.
 */
async function getEasyCurrenciesExchangeRate(
	currencyFrom: string,
	currencyTo: string,
	currencyAmount: number
): Promise<ConversionResult> {
	try {
		console.log('[Easy-Currencies] Attempting to fetch rate');

		const converter = new Converter();

		// Convert the currency
		const converted = await converter.convert(currencyAmount, currencyFrom, currencyTo);

		// 'converted' contains the converted amount directly
		const convertedAmount = converted.toFixed(2);

		// Fetch the rates for the base currency to get the rate directly
		const rates = await Convert().from(currencyFrom).fetch();
		const rate = rates.rates[currencyTo]?.toFixed(6);

		// Check if conversion was successful
		if (!isNaN(Number(convertedAmount)) && rate) {
			return {
				success: true,
				rate,
				convertedAmount
			};
		} else {
			return {
				success: false,
				error: 'Failed to convert currency using easy-currencies'
			};
		}
	} catch (err) {
		console.error('[Easy-Currencies] Error:', err);
		return {
			success: false,
			error: 'An error occurred while converting currency'
		};
	}
}

/**
 * Free fallback API using Frankfurter (ECB rates - free, no API key needed)
 */
async function getFrankfurterExchangeRate(
	currencyFrom: string,
	currencyTo: string,
	amount: number
): Promise<ConversionResult> {
	try {
		console.log('[Frankfurter] Attempting to fetch rate');

		const response = await fetch(
			`https://api.frankfurter.app/latest?amount=${amount}&from=${currencyFrom}&to=${currencyTo}`
		);

		if (!response.ok) {
			console.error('[Frankfurter] API request failed:', response.status);
			return { success: false, error: 'Frankfurter API request failed' };
		}

		const data = await response.json();
		console.log('[Frankfurter] Response:', data);

		if (data.rates && data.rates[currencyTo]) {
			const convertedAmount = data.rates[currencyTo].toString();
			const rate = (parseFloat(convertedAmount) / amount).toFixed(6);
			return {
				success: true,
				rate,
				convertedAmount: parseFloat(convertedAmount).toFixed(2)
			};
		}

		return { success: false, error: 'No rate found in Frankfurter API response' };
	} catch (error) {
		console.error('[Frankfurter] Error:', error);
		return { success: false, error: 'Frankfurter API error' };
	}
}

/**
 * Validates if the conversion result is reasonable.
 */
function isValidConversionResult(result: ConversionResult, currencyAmount: number): boolean {
	if (!result.success || !result.rate || !result.convertedAmount) {
		return false;
	}
	const rate = parseFloat(result.rate);
	const convertedAmount = parseFloat(result.convertedAmount);
	return rate > 0 && convertedAmount > 0 && Math.abs(convertedAmount - currencyAmount * rate) < 0.1;
}

// ============================================================================
// QUERY FUNCTIONS - Read data from server
// ============================================================================

/**
 * Get all available currencies with full info including symbol and flag
 */
export const getCurrencies = query(async () => {
	// Return the comprehensive list of world currencies with all info
	return WORLD_CURRENCIES.map(({ value, label, symbol }) => ({
		value,
		label,
		symbol
	}));
});

/**
 * Get currency info with symbol and flag
 */
export const getCurrencyInfo = query(
	v.string(),
	async (currencyCode: string): Promise<CurrencyInfo | null> => {
		const currency = WORLD_CURRENCIES.find((c) => c.value === currencyCode.toUpperCase());
		return currency || null;
	}
);

// ============================================================================
// FORM FUNCTIONS - Handle form submissions
// ============================================================================

/**
 * Convert currency form handler
 * Returns conversion result on successful submission
 */
export const convertCurrencyForm = form(
	v.object({
		from: v.pipe(v.string(), v.regex(CURRENCY_CODE_REGEX, 'Invalid currency code')),
		to: v.pipe(v.string(), v.regex(CURRENCY_CODE_REGEX, 'Invalid currency code')),
		amount: v.pipe(v.number(), v.minValue(0.01), v.maxValue(MAX_AMOUNT)),
		forceRefresh: v.optional(v.boolean(), false)
	}),
	async ({ from, to, amount, forceRefresh }) => {
		console.log('Converting currency:', { from, to, amount, forceRefresh });

		// Handle same currency conversion
		if (from === to) {
			return {
				rate: '1.000000',
				convertedAmount: amount.toFixed(2),
				cached: false,
				fromCurrency: from,
				toCurrency: to,
				originalAmount: amount
			};
		}

		// Check cache unless forceRefresh is true
		const cacheKey = getCacheKey(from, to);
		const cachedResult = rateCache.get(cacheKey);

		if (!forceRefresh && cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
			console.log('Using cached rate');
			const convertedAmount = (amount * parseFloat(cachedResult.rate)).toFixed(2);
			return {
				rate: cachedResult.rate,
				convertedAmount,
				cached: true,
				cacheAge: Math.round((Date.now() - cachedResult.timestamp) / 1000),
				fromCurrency: from,
				toCurrency: to,
				originalAmount: amount
			};
		}

		// Try easy-currencies first (preferred)
		let result = await getEasyCurrenciesExchangeRate(from, to, amount);

		// If easy-currencies fails, try Frankfurter as fallback (free, no API key)
		if (!isValidConversionResult(result, amount)) {
			console.log('easy-currencies failed or returned invalid result, trying Frankfurter');
			result = await getFrankfurterExchangeRate(from, to, amount);
		}

		if (result.success && result.rate && result.convertedAmount) {
			// Cache the successful result (only cache the rate, not the converted amount)
			rateCache.set(cacheKey, {
				rate: result.rate,
				timestamp: Date.now()
			});

			return {
				rate: result.rate,
				convertedAmount: result.convertedAmount,
				cached: false,
				fromCurrency: from,
				toCurrency: to,
				originalAmount: amount
			};
		}

		throw new Error('Unable to fetch exchange rates from any source');
	}
);
