// import { error } from '@sveltejs/kit';
// import { page } from '$app/stores';
// import type { PageLoad } from './$types';

// export interface ApiError {
// 	title: string;
// 	message: string;
// 	resolution: string;
// }

// export interface DictionaryEntry {
// 	word: string;
// 	phonetic?: string;
// 	phonetics?: Phonetic[];
// 	meanings: Meaning[];
// 	license: License;
// 	sourceUrls?: string[];
// 	origin?: string;
// }

// interface Phonetic {
// 	text: string;
// 	audio?: string;
// 	sourceUrl?: string;
// 	license?: License;
// }

// interface License {
// 	name: string;
// 	url: string;
// }

// interface Meaning {
// 	partOfSpeech: string;
// 	definitions: Definition[];
// 	synonyms?: string[];
// 	antonyms?: string[];
// }

// interface Definition {
// 	definition: string;
// 	synonyms?: string[];
// 	antonyms?: string[];
// 	example?: string;
// }
// export const _fetchDictionaryEntry = async (word: string): Promise<DictionaryEntry | ApiError> => {
// 	const encodedWord = encodeURIComponent(word);
// 	const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodedWord}`;
// 	try {
// 		const response = await fetch(apiUrl);

// 		if (!response.ok) {
// 			const errorData: ApiError = await response.json();
// 			return errorData; // Return the error data directly
// 		}
// 		const data: DictionaryEntry = await response.json();
// 		return data;
// 	} catch (error) {
// 		console.error('Network error:', error);
// 		// Construct and return a custom error object
// 		return {
// 			title: 'Network Error',
// 			message: 'Failed to fetch dictionary entry',
// 			resolution: 'Please try again later.'
// 		};
// 	}
// };
