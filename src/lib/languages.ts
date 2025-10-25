/**
 * Language Configuration
 * Defines all available languages in the application with their metadata
 */

export interface Language {
	code: string;
	name: string;
	nativeName: string;
	flag: string;
	dir?: 'ltr' | 'rtl'; // text direction
}

export const AVAILABLE_LANGUAGES: Language[] = [
	{
		code: 'en',
		name: 'English',
		nativeName: 'English',
		flag: '🇬🇧',
		dir: 'ltr'
	},
	{
		code: 'es',
		name: 'Spanish',
		nativeName: 'Español',
		flag: '🇪🇸',
		dir: 'ltr'
	},
	{
		code: 'fr',
		name: 'French',
		nativeName: 'Français',
		flag: '🇫🇷',
		dir: 'ltr'
	},
	{
		code: 'de',
		name: 'German',
		nativeName: 'Deutsch',
		flag: '🇩🇪',
		dir: 'ltr'
	},
	{
		code: 'zh',
		name: 'Chinese',
		nativeName: '中文',
		flag: '🇨🇳',
		dir: 'ltr'
	},
	{
		code: 'ja',
		name: 'Japanese',
		nativeName: '日本語',
		flag: '🇯🇵',
		dir: 'ltr'
	},
	{
		code: 'pt',
		name: 'Portuguese',
		nativeName: 'Português',
		flag: '🇵🇹',
		dir: 'ltr'
	},
	{
		code: 'ar',
		name: 'Arabic',
		nativeName: 'العربية',
		flag: '🇸🇦',
		dir: 'rtl'
	}
];

/**
 * Get language by code
 */
export function getLanguage(code: string): Language | undefined {
	return AVAILABLE_LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Get language name by code
 */
export function getLanguageName(code: string): string {
	const language = getLanguage(code);
	return language?.nativeName || code;
}

/**
 * Check if a language code is valid
 */
export function isValidLanguage(code: string): boolean {
	return AVAILABLE_LANGUAGES.some((lang) => lang.code === code);
}

/**
 * Get default language code
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Get all language codes
 */
export const LANGUAGE_CODES = AVAILABLE_LANGUAGES.map((lang) => lang.code);
