import type { Actions } from './$types';

export interface ApiError {
	title: string;
	message: string;
	resolution: string;
}

export interface DictionaryEntry {
	word: string;
	phonetic?: string;
	phonetics?: Phonetic[];
	meanings: Meaning[];
	license: License;
	sourceUrls?: string[];
	origin?: string;
}

interface Phonetic {
	text: string;
	audio?: string;
	sourceUrl?: string;
	license?: License;
}

interface License {
	name: string;
	url: string;
}

interface Meaning {
	partOfSpeech: string;
	definitions: Definition[];
	synonyms?: string[];
	antonyms?: string[];
}

interface Definition {
	definition: string;
	synonyms?: string[];
	antonyms?: string[];
	example?: string;
}

export const actions: Actions = {
	default: async ({ request }) => {
		// Extract form data from the request
		const formData = await request.formData();
		// Retrieve the 'word' field from the form data and convert it to a string
		const word = String(formData.get('word'));

		// Encode the word to ensure it's URL-safe
		const encodedWord = encodeURIComponent(word);
		// Construct the API URL using the encoded word
		const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodedWord}`;

		try {
			// Attempt to fetch data from the API
			const response = await fetch(apiUrl);

			// Check if the response was successful
			if (!response.ok) {
				// If not, parse the error data from the response
				const errorData: ApiError = await response.json();
				// Return the error data along with the original word and an indication of an error
				return { word, error: true, errorData };
			}

			// If the response was successful, parse the data from the response
			const data: DictionaryEntry[] = await response.json();
			// Return the data along with the original word and an indication of no error
			return { word, error: false, data };
		} catch (error) {
			// Handle any network errors that occurred during the fetch operation
			console.error('Network error:', error);
			// In case of a network error, construct and return a custom error object
			return {
				word,
				error: true,
				title: 'Network Error', // Title of the error
				message: 'Failed to fetch dictionary entry', // Detailed message about the error
				resolution: 'Please try again later.' // Suggested action to resolve the error
			};
		}
	}
};
