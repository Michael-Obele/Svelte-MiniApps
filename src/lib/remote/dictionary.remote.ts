import { form, query } from '$app/server';
import * as v from 'valibot';

// Types
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
	text?: string;
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

export interface ApiError {
	title: string;
	message: string;
	resolution: string;
}

// Constants
const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_WORD_LENGTH = 50;
const REQUEST_TIMEOUT = 5000; // 5 seconds

// Cache implementation
const cache = new Map<string, { data: DictionaryEntry[]; timestamp: number }>();

function getCachedData(key: string): DictionaryEntry[] | null {
	const cached = cache.get(key.toLowerCase());
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		console.log('[Dictionary] Cache hit for:', key);
		return cached.data;
	}
	return null;
}

function setCacheData(key: string, data: DictionaryEntry[]): void {
	cache.set(key.toLowerCase(), { data, timestamp: Date.now() });
	// Clean up old cache entries (limit cache size)
	if (cache.size > 100) {
		const oldestKey = Array.from(cache.keys())[0];
		cache.delete(oldestKey);
	}
}

// Helper function to fetch dictionary data with timeout
async function fetchDictionaryData(
	word: string
): Promise<{ data: DictionaryEntry[] | null; error?: ApiError }> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

	try {
		const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(word)}`, {
			signal: controller.signal,
			headers: {
				Accept: 'application/json',
				'User-Agent': 'SvelteMiniApps/1.0'
			}
		});

		clearTimeout(timeout);

		if (!response.ok) {
			if (response.status === 404) {
				const errorData = await response.json();
				return {
					data: null,
					error: {
						title: errorData.title || 'Word Not Found',
						message: errorData.message || `We couldn't find the word "${word}" in our dictionary.`,
						resolution:
							errorData.resolution ||
							'Please check your spelling or try searching for a different word.'
					}
				};
			}
			return {
				data: null,
				error: {
					title: 'API Error',
					message: 'The dictionary service returned an error.',
					resolution: 'Please try again later.'
				}
			};
		}

		const data: DictionaryEntry[] = await response.json();
		return { data };
	} catch (error) {
		clearTimeout(timeout);

		if ((error as Error).name === 'AbortError') {
			return {
				data: null,
				error: {
					title: 'Request Timeout',
					message: 'The request took too long to complete.',
					resolution: 'Please try again. If the problem persists, check your internet connection.'
				}
			};
		}

		return {
			data: null,
			error: {
				title: 'Network Error',
				message: 'Failed to connect to the dictionary service.',
				resolution: 'Please check your internet connection and try again.'
			}
		};
	}
}

// ============================================================================
// FORM FUNCTIONS - Handle form submissions
// ============================================================================

/**
 * Search dictionary form handler
 * Returns dictionary entries on successful submission
 */
export const searchDictionary = form(
	v.object({
		word: v.pipe(
			v.string(),
			v.trim(),
			v.nonEmpty('Please enter a word to search'),
			v.maxLength(MAX_WORD_LENGTH, `Word cannot be longer than ${MAX_WORD_LENGTH} characters`),
			v.regex(/^[a-zA-Z\s-]+$/, 'Word can only contain letters, spaces, and hyphens')
		)
	}),
	async ({ word }) => {
		const normalizedWord = word.toLowerCase().trim();
		console.log('[Dictionary] Searching for:', normalizedWord);

		// Check cache first
		const cachedData = getCachedData(normalizedWord);
		if (cachedData) {
			return {
				success: true,
				word: normalizedWord,
				data: cachedData,
				cached: true
			};
		}

		// Fetch from API
		const { data, error } = await fetchDictionaryData(normalizedWord);

		if (error) {
			return {
				success: false,
				word: normalizedWord,
				error,
				data: null
			};
		}

		// Cache successful response
		if (data) {
			setCacheData(normalizedWord, data);
		}

		return {
			success: true,
			word: normalizedWord,
			data,
			cached: false
		};
	}
);

// ============================================================================
// QUERY FUNCTIONS - Read data from server
// ============================================================================

/**
 * Get recent searches (could be expanded to store in database)
 */
export const getRecentSearches = query(async () => {
	// This could be expanded to fetch from database for logged-in users
	return [] as string[];
});
