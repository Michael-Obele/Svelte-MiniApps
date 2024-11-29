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
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

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

			// Fetch exchange rate with retry mechanism
			let attempts = 0;
			const maxAttempts = 3;
			let lastError: Error | null = null;

			while (attempts < maxAttempts) {
				try {
					console.log(`Attempt ${attempts + 1}/${maxAttempts} to fetch rates`);
					
					const response = await fetchWithTimeout(
						`https://www.google.com/search?q=${currencyAmount}+${currencyFrom}+to+${currencyTo}+&hl=en`,
						{
							headers: {
								'User-Agent': USER_AGENT,
								'Accept': 'text/html',
								'Accept-Language': 'en-US,en;q=0.9'
							}
						},
						7000
					);

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					const body = await response.text();
					console.log('Response received, parsing data...');
					
					const $ = cheerio.load(body);
					
					// Debug the HTML content
					console.log('HTML Content:', body.substring(0, 500)); // Log first 500 chars of response
					
					// Try multiple possible selectors
					let rate: string | undefined;
					
					// Try different selectors that might contain the rate
					const possibleSelectors = [
						'.SwHCTb', // Common selector for currency conversion
						'.DFlfde', // Alternative selector
						'.iBp4i',  // Previous selector
						'[data-value]', // Generic attribute selector
						'.dDoNo' // Another possible selector
					];
					
					for (const selector of possibleSelectors) {
						const element = $(selector);
						console.log(`Trying selector "${selector}":`, element.text());
						if (element.length > 0) {
							const text = element.text().trim();
							if (text) {
								rate = text.split(' ')[0];
								console.log(`Found rate with selector "${selector}":`, rate);
								break;
							}
						}
					}

					if (!rate) {
						// If no rate found, try a more general approach
						const bodyText = $('body').text();
						const matches = bodyText.match(/(\d+\.?\d*)\s*[A-Z]{3}/);
						if (matches) {
							rate = matches[1];
							console.log('Found rate using regex:', rate);
						}
					}

					if (!rate) {
						console.error('No rate found in response');
						throw new Error('Rate information not found');
					}

					console.log('Successfully parsed rate:', rate);

					return {
						success: true,
						currencyFrom,
						currencyTo,
						currencyAmount,
						status: 200,
						body: {
							rate,
							timestamp: new Date().toISOString()
						}
					};
				} catch (error) {
					console.error(`Attempt ${attempts + 1} failed:`, error);
					lastError = error as Error;
					attempts++;
					
					if (attempts < maxAttempts) {
						const delay = 1000 * attempts;
						console.log(`Retrying in ${delay}ms...`);
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
					errorMessage = 'The currency service is temporarily unavailable.';
				} else if (lastError.message === 'Rate information not found') {
					errorMessage = 'Invalid currency pair or rate not available.';
				}
			}

			return fail(500, {
				success: false,
				error: errorMessage,
				values: { currencyFrom, currencyTo, currencyAmount }
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
