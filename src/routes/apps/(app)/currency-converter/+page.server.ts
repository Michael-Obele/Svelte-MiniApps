import { error, fail, type Actions } from '@sveltejs/kit';
import * as cheerio from 'cheerio';
import { env } from '$env/dynamic/private';
import { Convert } from 'easy-currencies';
import { Converter } from 'easy-currencies';

// Types
interface ConversionResult {
	success: boolean;
	rate?: string;
	convertedAmount?: string;
	error?: string;
}

// Validation constants
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;
const MAX_AMOUNT = 999999999;

// Cache configuration
const CACHE_DURATION = 8 * 60 * 1000; // 5 minutes in milliseconds
const rateCache = new Map<string, { rate: string; timestamp: number }>();

function getCacheKey(from: string, to: string): string {
	return `${from}-${to}`;
}

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

		const converter = new Converter('AlphaVantage', env.AlphaVantage);

		// Convert the currency
		// const converted = await Convert(currencyAmount).from(currencyFrom).to(currencyTo);
		const converted = await converter.convert(currencyAmount, currencyFrom, currencyTo);

		// 'converted' contains the converted amount directly
		const convertedAmount = converted.toFixed(2);

		// Fetch the rates for the base currency to get the rate directly
		const rates = await Convert().from(currencyFrom).fetch();
		const rate = rates.rates[currencyTo].toFixed(6); // Assuming 6 decimal places for precision

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
 * Attempts to get exchange rate from Exchange Rate API
 */
async function getExchangeRateAPI(
	currencyFrom: string,
	currencyTo: string,
	amount: number
): Promise<ConversionResult> {
	try {
		console.log('[ExchangeRate-API] Attempting to fetch rate');
		const apiKey = env.EXCHANGE_RATE_API_KEY;

		if (!apiKey) {
			console.error('[ExchangeRate-API] No API key found');
			return { success: false, error: 'Exchange Rate API key not configured' };
		}

		const response = await fetch(
			`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${currencyFrom}/${currencyTo}/${amount}`
		);

		if (!response.ok) {
			console.error('[ExchangeRate-API] API request failed:', response.status);
			return { success: false, error: 'Exchange Rate API request failed' };
		}

		const data = await response.json();
		console.log('[ExchangeRate-API] Response:', data);

		if (data.conversion_rate && data.conversion_result) {
			return {
				success: true,
				rate: data.conversion_rate.toString(),
				convertedAmount: data.conversion_result.toString()
			};
		}

		return { success: false, error: 'No rate found in API response' };
	} catch (error) {
		console.error('[ExchangeRate-API] Error:', error);
		return { success: false, error: 'Exchange Rate API error' };
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

export const actions: Actions = {
	default: async ({ request }) => {
		try {
			// Parse form data
			const formData = await request.formData();
			let currencyFrom: string = String(formData.get('currencyFrom')).trim().toUpperCase();
			let currencyTo: string = String(formData.get('currencyTo')).trim().toUpperCase();
			const rawAmount = String(formData.get('currencyAmount')).replace(/,/g, '');
			const currencyAmount = Number(rawAmount);
			const forceRefresh = formData.get('forceRefresh') === 'true';

			console.log('Processing request:', {
				currencyFrom,
				currencyTo,
				currencyAmount,
				forceRefresh
			});

			// Input validation
			if (!CURRENCY_CODE_REGEX.test(currencyFrom)) {
				return fail(400, {
					error: 'Please enter a valid 3-letter currency code (e.g., USD)',
					field: 'currencyFrom',
					values: { currencyFrom, currencyTo, currencyAmount }
				});
			}

			if (!CURRENCY_CODE_REGEX.test(currencyTo)) {
				return fail(400, {
					error: 'Please enter a valid 3-letter currency code (e.g., EUR)',
					field: 'currencyTo',
					values: { currencyFrom, currencyTo, currencyAmount }
				});
			}

			if (
				!currencyAmount ||
				isNaN(currencyAmount) ||
				currencyAmount <= 0 ||
				currencyAmount > MAX_AMOUNT
			) {
				return fail(400, {
					error: 'Please enter a valid amount between 0 and 999,999,999',
					field: 'currencyAmount',
					values: { currencyFrom, currencyTo, currencyAmount }
				});
			}

			// Check cache unless forceRefresh is true
			const cacheKey = getCacheKey(currencyFrom, currencyTo);
			const cachedResult = rateCache.get(cacheKey);

			if (!forceRefresh && cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
				console.log('Using cached rate');
				const convertedAmount = (currencyAmount * parseFloat(cachedResult.rate)).toFixed(2);
				const response = {
					success: true,
					currencyFrom,
					currencyTo,
					currencyAmount,
					status: 200,
					body: {
						rate: cachedResult.rate,
						convertedAmount,
						timestamp: new Date().toISOString(),
						cached: true,
						cacheAge: Math.round((Date.now() - cachedResult.timestamp) / 1000) // age in seconds
					}
				};
				console.log('[Server] Sending successful response to frontend:', response);
				return response;
			}

			// Use easy-currencies instead of Google scraping or Exchange Rate API
			let result = await getEasyCurrenciesExchangeRate(currencyFrom, currencyTo, currencyAmount);

			// If easy-currencies or returns an invalid result, try Exchange Rate API
			if (!isValidConversionResult(result, currencyAmount)) {
				console.log('Google scraping failed or returned invalid result, trying Exchange Rate API');
				result = await getExchangeRateAPI(currencyFrom, currencyTo, currencyAmount);
			}

			if (result.success && result.rate && result.convertedAmount) {
				// Cache the successful result (only cache the rate, not the converted amount)
				rateCache.set(cacheKey, {
					rate: result.rate,
					timestamp: Date.now()
				});

				// Send the rate to the frontend
				const response = {
					success: true,
					currencyFrom,
					currencyTo,
					currencyAmount,
					status: 200,
					body: {
						rate: result.rate,
						convertedAmount: result.convertedAmount,
						timestamp: new Date().toISOString(),
						cached: false
					}
				};
				console.log('[Server] Sending successful response to frontend:', response);
				return response;
			}

			// Both methods failed
			const errorResponse = fail(500, {
				success: false,
				error: 'Unable to fetch exchange rates from any source',
				values: { currencyFrom, currencyTo, currencyAmount }
			});
			console.log('[Server] Sending error response to frontend:', errorResponse);
			return errorResponse;
		} catch (error) {
			console.error('[Server] Unexpected error:', error);
			const errorResponse = fail(500, {
				success: false,
				error: 'An unexpected error occurred. Please try again later.'
			});
			console.log('[Server] Sending error response to frontend:', errorResponse);
			return errorResponse;
		}
	}
};
