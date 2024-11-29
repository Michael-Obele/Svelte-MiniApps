import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// Constants
const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const MAX_WORD_LENGTH = 50;

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();

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

// Helper function to validate word
function validateWord(word: string): string | null {
	if (!word || typeof word !== 'string') {
		return 'Word is required';
	}
	
	const trimmedWord = word.trim();
	
	if (trimmedWord.length === 0) {
		return 'Word cannot be empty';
	}
	
	if (trimmedWord.length > MAX_WORD_LENGTH) {
		return `Word cannot be longer than ${MAX_WORD_LENGTH} characters`;
	}
	
	if (!/^[a-zA-Z\s-]+$/.test(trimmedWord)) {
		return 'Word can only contain letters, spaces, and hyphens';
	}
	
	return null;
}

// Helper function to check cache
function getCachedData(key: string): any | null {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		console.log('Cache hit for:', key);
		return cached.data;
	}
	return null;
}

// Helper function to set cache
function setCacheData(key: string, data: any): void {
	cache.set(key, { data, timestamp: Date.now() });
	// Clean up old cache entries
	if (cache.size > 100) { // Limit cache size
		const oldestKey = Array.from(cache.keys())[0];
		cache.delete(oldestKey);
	}
}

// Helper function to fetch dictionary data with timeout
async function fetchDictionaryData(word: string): Promise<{ data: DictionaryEntry[] | null; error?: any }> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	try {
		const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(word)}`, {
			signal: controller.signal,
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'SvelteMiniApps/1.0'
			}
		});

		clearTimeout(timeout);

		if (!response.ok) {
			const errorData: ApiError = await response.json();
			return { data: null, error: errorData };
		}

		const data: DictionaryEntry[] = await response.json();
		return { data };
	} catch (error) {
		clearTimeout(timeout);
		throw error;
	}
}

// Helper function to handle API errors
function handleApiError(error: any, word: string) {
	if ((error as Error).name === 'AbortError') {
		return fail(408, {
			word,
			error: true,
			title: 'Request Timeout',
			message: 'The request took too long to complete.',
			resolution: 'Please try again. If the problem persists, check your internet connection.'
		});
	}

	return fail(500, {
		word,
		error: true,
		title: 'Service Error',
		message: 'An unexpected error occurred while fetching the dictionary data.',
		resolution: 'Please try again later. If the problem persists, contact support.'
	});
}

export const actions: Actions = {
	default: async ({ request }) => {
		// Extract and validate form data
		const formData = await request.formData();
		const word = String(formData.get('word'));
		
		try {
			// Validate input
			const validationError = validateWord(word);
			if (validationError) {
				return fail(400, {
					word,
					error: true,
					title: 'Invalid Input',
					message: validationError,
					resolution: 'Please enter a valid word using only letters, spaces, or hyphens.'
				});
			}

			const trimmedWord = word.trim().toLowerCase();
			
			// Check cache first
			const cachedData = getCachedData(trimmedWord);
			if (cachedData) {
				return {
					word: trimmedWord,
					error: false,
					data: cachedData,
					cached: true
				};
			}

			// Fetch data from API
			try {
				const { data, error } = await fetchDictionaryData(trimmedWord);
				
				if (error) {
					return fail(400, {
						word: trimmedWord,
						error: true,
						...error
					});
				}

				// Cache the successful response
				setCacheData(trimmedWord, data);

				return {
					word: trimmedWord,
					error: false,
					data,
					cached: false
				};
			} catch (error) {
				return handleApiError(error, trimmedWord);
			}
		} catch (error) {
			console.error('Dictionary API error:', error);
			return handleApiError(error, word);
		}
	}
};
