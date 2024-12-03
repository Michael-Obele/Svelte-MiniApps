import { error, fail, type Actions } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

/**
 * Fetches a resource with a specified timeout.
 *
 * @param url - The URL of the resource to fetch.
 * @param options - An options object that configures the fetch operation.
 * @param timeout - The timeout duration in milliseconds (default is 7000ms).
 * @returns A Promise that resolves with the fetched response or rejects with an error if the request times out.
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

// Get a random User-Agent
function getRandomUserAgent(): string {
	return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Generate cache key
function getCacheKey(from: string, to: string): string {
	return `${from}-${to}`;
}

export const actions: Actions = {
	default: async ({ request }) => {
		try {
			// Parse form data from the incoming request
			const formData = await request.formData();
			let currencyFrom: string = String(formData.get('currencyFrom')).trim().toUpperCase();
			let currencyTo: string = String(formData.get('currencyTo')).trim().toUpperCase();
			const rawAmount = String(formData.get('currencyAmount')).replace(/,/g, '');
			const currencyAmount = Number(rawAmount);

			console.log('Processing request:', { currencyFrom, currencyTo, currencyAmount });

			// Enhanced input validation
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

			// Check cache first
			const cacheKey = getCacheKey(currencyFrom, currencyTo);
			const cachedResult = rateCache.get(cacheKey);
			
			if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
				console.log('Using cached rate');
				return {
					success: true,
					currencyFrom,
					currencyTo,
					currencyAmount,
					status: 200,
					body: {
						rate: cachedResult.rate,
						timestamp: new Date().toISOString(),
						cached: true
					}
				};
			}

			// Fetch exchange rate with retry mechanism
			let attempts = 0;
			const maxAttempts = 3;
			let lastError: Error | null = null;

			while (attempts < maxAttempts) {
				try {
					// Add random delay between attempts (1-3 seconds)
					if (attempts > 0) {
						const randomDelay = Math.floor(Math.random() * 2000) + 1000;
						await new Promise(resolve => setTimeout(resolve, randomDelay));
					}

					console.log(`Attempt ${attempts + 1}/${maxAttempts} to fetch rates`);
					console.log('Request URL:', `https://www.google.com/search?q=${currencyAmount}+${currencyFrom}+to+${currencyTo}+&hl=en`);
					const selectedUserAgent = getRandomUserAgent();
					console.log('Using User-Agent:', selectedUserAgent);
					
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

					console.log('Response status:', response.status);
					console.log('Response headers:', Object.fromEntries(response.headers.entries()));

					if (!response.ok) {
						// Special handling for rate limiting
						if (response.status === 429) {
							const retryAfter = response.headers.get('retry-after');
							const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempts), 10000);
							console.log(`Rate limited (429). Retry-After header: ${retryAfter}, Waiting: ${waitTime}ms`);
							await new Promise(resolve => setTimeout(resolve, waitTime));
							attempts++;
							continue;
						}
						console.error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}`);
						throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
					}

					const body = await response.text();
					console.log('Response received, content length:', body.length);
					console.log('First 1000 characters of response:', body.substring(0, 1000));
					
					const $ = cheerio.load(body);
					
					// Try multiple possible selectors
					let rate: string | undefined;
					let foundSelector: string | undefined;
					
					// Try different selectors that might contain the rate
					const possibleSelectors = [
						'.SwHCTb',    // Common selector for currency conversion
						'.DFlfde',    // Alternative selector
						'.iBp4i',     // Previous selector
						'[data-value]', // Generic attribute selector
						'.dDoNo',     // Another possible selector
						'.BNeawe.iBp4i.AP7Wnd', // Additional selector
						'.BNeawe.tAd8D.AP7Wnd'  // Additional selector
					];
					
					console.log('Attempting to find rate with selectors...');
					for (const selector of possibleSelectors) {
						const element = $(selector);
						const text = element.text().trim();
						console.log(`Selector "${selector}":`, { found: element.length > 0, text });
						if (element.length > 0 && text) {
							rate = text.split(' ')[0];
							foundSelector = selector;
							console.log(`Found rate "${rate}" with selector "${selector}"`);
							break;
						}
					}

					if (!rate) {
						console.log('No rate found with selectors, trying regex approach...');
						const bodyText = $('body').text();
						console.log('Body text sample:', bodyText.substring(0, 200));
						const matches = bodyText.match(/(\d+\.?\d*)\s*[A-Z]{3}/);
						if (matches) {
							rate = matches[1];
							console.log('Found rate using regex:', rate, 'Full match:', matches[0]);
						}
					}

					if (!rate) {
						console.error('No rate found in response');
						console.log('Available text content:', $('body').text().substring(0, 500));
						throw new Error('Rate information not found');
					}

					console.log('Successfully parsed rate:', {
						rate,
						foundWith: foundSelector || 'regex',
						currencyPair: `${currencyFrom}-${currencyTo}`
					});

					// Cache the successful result
					rateCache.set(cacheKey, {
						rate,
						timestamp: Date.now()
					});

					return {
						success: true,
						currencyFrom,
						currencyTo,
						currencyAmount,
						status: 200,
						body: {
							rate,
							timestamp: new Date().toISOString(),
							cached: false
						}
					};
				} catch (error) {
					console.error(`Attempt ${attempts + 1} failed:`, {
						error,
						message: error instanceof Error ? error.message : 'Unknown error',
						stack: error instanceof Error ? error.stack : undefined,
						type: error instanceof Error ? error.constructor.name : typeof error
					});
					lastError = error as Error;
					attempts++;
					
					if (attempts < maxAttempts) {
						const delay = 1000 * attempts;
						console.log(`Retrying in ${delay}ms...`, {
							attemptNumber: attempts,
							maxAttempts,
							nextDelayMs: delay
						});
						await new Promise(resolve => setTimeout(resolve, delay));
					}
				}
			}

			// Handle all attempts failed
			console.error('All attempts failed. Last error:', lastError);
			
			let errorMessage = 'Unable to fetch currency rates';
			if (lastError instanceof Error) {
				if (lastError.message === 'Request timed out') {
					errorMessage = 'The request timed out. Please try again.';
				} else if (lastError.message.includes('HTTP error')) {
					if (lastError.message.includes('429')) {
						errorMessage = 'Service is temporarily unavailable due to too many requests. Please try again in a few minutes.';
					} else {
						errorMessage = 'The currency service is temporarily unavailable.';
					}
				} else if (lastError.message === 'Rate information not found') {
					errorMessage = 'Invalid currency pair or rate not available.';
				}
			} else {
				// Handle case when lastError is null
				errorMessage = 'Unable to connect to the currency service. Please check your internet connection and try again.';
			}

			return fail(500, {
				success: false,
				error: errorMessage,
				values: { currencyFrom, currencyTo, currencyAmount },
				status: 500
			});

		} catch (error) {
			console.error('Unexpected error:', error);
			return fail(500, {
				success: false,
				error: 'An unexpected error occurred. Please try again later.'
			});
		}
	}
};
