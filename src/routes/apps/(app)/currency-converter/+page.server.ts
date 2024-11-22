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
) {
	return Promise.race([
		fetch(url, options),
		new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
	]);
}

export const actions: Actions = {
	default: async ({ request }) => {
		// Parse form data from the incoming request
		const formData = await request.formData();
		let currencyFrom: string = String(formData.get('currencyFrom')); // Extract currencyFrom from form data
		let currencyTo: string = String(formData.get('currencyTo')); // Extract currencyTo from form data
		const convertedNumber = parseFloat(String(formData.get('currencyAmount')).replace(/,/g, ''));
		let currencyAmount: number = Number(convertedNumber); // Extract currencyAmount from form data

		// Validate input fields
		if (!currencyFrom) {
			throw new Error('currencyFrom is required'); // Throw error if currencyFrom is missing
		}

		if (!currencyTo) {
			throw new Error('currencyTo is required'); // Throw error if currencyTo is missing
		}

		if (!currencyAmount) {
			throw new Error('currencyAmount is required'); // Throw error if currencyAmount is missing
		}

		// Trim any leading/trailing whitespace from currency codes
		currencyFrom = currencyFrom.trim();
		currencyTo = currencyTo.trim();

		try {
			// Fetch exchange rate data from Google Search results
			const response = await fetchWithTimeout(
				`https://www.google.com/search?q=${currencyAmount}+${currencyFrom}+to+${currencyTo}+&hl=en`,
				{}
			);
			if (!(response as Response).ok) {
				console.error(response); // Log network errors
				throw new Error('Network response was not ok'); // Throw error if response is not OK
			}
			const body = await (response as Response).text(); // Read response body as text
			const $ = cheerio.load(body); // Load HTML into Cheerio for parsing

			// Extract exchange rate text from parsed HTML
			const rate = $('.iBp4i').text().split(' ')[0];
			if (!rate) {
				throw new Error('Rate text not found'); // Throw error if rate text is missing
			}
			

			// Construct and return successful response
			return {
				currencyFrom,
				currencyTo,
				currencyAmount,
				status: 200,
				body: {
					rate
				}
			};
		} catch (error) {
			console.error('Error fetching rates:', error); // Log any errors during processing
			// Construct and return error response
			return fail(500, {
				currencyFrom,
				currencyTo,
				currencyAmount,
				error: 'Failed to fetch currency rates'
			});
		}
	}
};
