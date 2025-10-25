import { browser } from '$app/environment';
import { PersistedState } from 'runed';
import { AVAILABLE_LANGUAGES, getLanguage, type Language } from '$lib/languages';
import { loadLocale } from 'wuchale/load-utils';

// Define valid language codes for validation
const validLanguageCodes = AVAILABLE_LANGUAGES.map((lang) => lang.code);

// Create a single shared persisted state instance
export const persistedLocale = new PersistedState<string>('app-locale', 'en', {
	storage: 'local', // Use localStorage for persistence across sessions
	syncTabs: true // Synchronize language changes across browser tabs
});

// Validate and sanitize the persisted locale on load
if (browser && !validLanguageCodes.includes(persistedLocale.current)) {
	persistedLocale.current = 'en';
}

/**
 * Set cookie for server-side rendering
 * Uses standard document.cookie API to sync with server hooks
 * @param locale - Language code to store in cookie
 */
function setCookie(locale: string) {
	if (!browser) return;
	// Cookie expires in 1 year, accessible across the entire site
	document.cookie = `app-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Change the application language
 * Updates persisted state, cookie, document attributes, and loads new locale catalogs
 * @param lang - Language object to switch to
 */
export async function changeLanguage(lang: Language) {
	if (!browser) return;

	// Update persisted state (automatically saves to localStorage and syncs across tabs)
	persistedLocale.current = lang.code;

	// Sync cookie for SSR
	setCookie(lang.code);

	// Update document attributes for accessibility and RTL support
	if (document.documentElement) {
		document.documentElement.dir = lang.dir || 'ltr';
		document.documentElement.lang = lang.code;
	}

	// Load the new locale catalogs dynamically (no page reload needed!)
	await loadLocale(lang.code);
}

/**
 * Get the current language object
 * Returns the English language as fallback if the current locale is invalid
 */
export function getCurrentLanguage(): Language {
	const lang = getLanguage(persistedLocale.current);
	// Fallback to English if language not found (should never happen due to validation)
	return lang || getLanguage('en')!;
}

/**
 * Initialize language settings on app load
 * This should be called once at app startup
 */
export function initLanguage() {
	if (!browser) return;

	const currentLang = getCurrentLanguage();

	// Update document attributes
	if (document.documentElement) {
		document.documentElement.dir = currentLang.dir || 'ltr';
		document.documentElement.lang = currentLang.code;
	}

	// Ensure cookie is always in sync with localStorage
	setCookie(currentLang.code);

	// Load locale catalogs
	loadLocale(currentLang.code).catch((err) => {
		console.error('Failed to load locale:', err);
	});
}
