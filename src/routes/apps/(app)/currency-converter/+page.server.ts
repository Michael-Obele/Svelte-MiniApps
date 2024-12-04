import { error, fail, type Actions } from '@sveltejs/kit';
import * as cheerio from 'cheerio';
import { env } from '$env/dynamic/private';

// Types
interface ConversionResult {
    success: boolean;
    rate?: string;
    convertedAmount?: string;
    error?: string;
}

/**
 * Fetches a resource with a specified timeout.
 */
async function fetchWithTimeout(
    url: string | URL | Request,
    options: RequestInit | undefined,
    timeout = 7000
): Promise<Response> {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
    ]) as Promise<Response>;
}

// Validation constants
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;
const MAX_AMOUNT = 999999999;

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const rateCache = new Map<string, { rate: string; timestamp: number }>();

// Multiple User-Agent strings to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
];

// Helper functions
function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getCacheKey(from: string, to: string): string {
    return `${from}-${to}`;
}

/**
 * Attempts to get exchange rate by scraping Google
 */
async function getGoogleExchangeRate(currencyFrom: string, currencyTo: string, currencyAmount: number): Promise<ConversionResult> {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
        try {
            if (attempts > 0) {
                const randomDelay = Math.floor(Math.random() * 2000) + 1000;
                await new Promise(resolve => setTimeout(resolve, randomDelay));
            }

            console.log(`[Google] Attempt ${attempts + 1}/${maxAttempts} to fetch rates`);
            const selectedUserAgent = getRandomUserAgent();
            
            const response = await fetchWithTimeout(
                `https://www.google.com/search?q=${currencyAmount}+${currencyFrom}+to+${currencyTo}+&hl=en`,
                {
                    headers: {
                        'User-Agent': selectedUserAgent,
                        'Accept': 'text/html',
                        'Accept-Language': 'en-US,en;q=0.9'
                    }
                },
                7000
            );

            console.log('[Google] Response status:', response.status);

            if (!response.ok) {
                if (response.status === 429) {
                    const retryAfter = response.headers.get('retry-after');
                    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempts), 10000);
                    console.log(`[Google] Rate limited (429). Waiting: ${waitTime}ms`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    attempts++;
                    continue;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const body = await response.text();
            const $ = cheerio.load(body);
            
            let rate: string | undefined;
            let foundSelector: string | undefined;
            
            const possibleSelectors = [
                '.SwHCTb',
                '.DFlfde',
                '.iBp4i',
                '[data-value]',
                '.dDoNo',
                '.BNeawe.iBp4i.AP7Wnd',
                '.BNeawe.tAd8D.AP7Wnd'
            ];
            
            for (const selector of possibleSelectors) {
                const element = $(selector);
                const text = element.text().trim();
                if (element.length > 0 && text) {
                    rate = text.split(' ')[0];
                    foundSelector = selector;
                    console.log(`[Google] Found rate "${rate}" with selector "${selector}"`);
                    break;
                }
            }

            if (!rate) {
                const bodyText = $('body').text();
                const matches = bodyText.match(/(\d+\.?\d*)\s*[A-Z]{3}/);
                if (matches) {
                    rate = matches[1];
                    console.log('[Google] Found rate using regex:', rate);
                }
            }

            if (!rate) {
                throw new Error('Rate information not found');
            }

            // Clean and parse the rate - this is actually the converted amount
            const cleanAmount = rate.replace(/[^\d.,]/g, '').replace(',', '.');
            const convertedAmount = parseFloat(cleanAmount);
            
            if (isNaN(convertedAmount)) {
                throw new Error('Invalid amount format');
            }

            // Calculate the actual rate by dividing the converted amount by the original amount
            const actualRate = (convertedAmount / currencyAmount).toFixed(6);

            return { 
                success: true, 
                rate: actualRate,
                convertedAmount: convertedAmount.toString() // Use the parsed number as string
            };
        } catch (error) {
            console.error(`[Google] Attempt ${attempts + 1} failed:`, error);
            lastError = error as Error;
            attempts++;
            
            if (attempts < maxAttempts) {
                const delay = 1000 * attempts;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    return { 
        success: false, 
        error: lastError?.message || 'Failed to fetch rate from Google' 
    };
}

/**
 * Attempts to get exchange rate from Exchange Rate API
 */
async function getExchangeRateAPI(currencyFrom: string, currencyTo: string, amount: number): Promise<ConversionResult> {
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

            console.log('Processing request:', { currencyFrom, currencyTo, currencyAmount, forceRefresh });

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

            if (!currencyAmount || isNaN(currencyAmount) || currencyAmount <= 0 || currencyAmount > MAX_AMOUNT) {
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

            // Try Google scraping first
            let result = await getGoogleExchangeRate(currencyFrom, currencyTo, currencyAmount);

            // If Google fails, try Exchange Rate API
            if (!result.success) {
                console.log('Google scraping failed, trying Exchange Rate API');
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
