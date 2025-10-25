<script lang="ts">
	import { browser } from '$app/environment';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { AVAILABLE_LANGUAGES, getLanguage, type Language } from '$lib/languages';
	import { PersistedState } from 'runed';
	import { loadLocale } from 'wuchale/load-utils';

	// Define valid language codes for validation
	const validLanguageCodes = AVAILABLE_LANGUAGES.map((lang) => lang.code);

	// Create persisted state that syncs across tabs and persists across sessions
	const persistedLocale = new PersistedState<string>('app-locale', 'en', {
		storage: 'local', // Use localStorage for persistence across sessions
		syncTabs: true // Synchronize language changes across browser tabs
	});

	// Validate and sanitize the persisted locale on load
	if (browser && !validLanguageCodes.includes(persistedLocale.current)) {
		persistedLocale.current = 'en';
	}

	// Derive current language from persisted state with guaranteed valid language
	let currentLanguage = $derived(getLanguage(persistedLocale.current));

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
	async function changeLanguage(lang: Language) {
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

	// Apply document settings and sync cookie when locale changes
	// This handles initial load and cross-tab sync
	$effect(() => {
		if (browser && currentLanguage) {
			// Update document attributes
			if (document.documentElement) {
				document.documentElement.dir = currentLanguage.dir || 'ltr';
				document.documentElement.lang = currentLanguage.code;
			}

			// Ensure cookie is always in sync with localStorage
			setCookie(currentLanguage.code);

			// Load locale catalogs when state changes (e.g., from another tab)
			loadLocale(currentLanguage.code).catch((err) => {
				console.error('Failed to load locale:', err);
			});
		}
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			>
				<span class="text-lg" aria-hidden="true">{currentLanguage?.flag}</span>
				<span class="hidden sm:inline">{currentLanguage?.nativeName}</span>
				<span class="sm:hidden">{currentLanguage?.code.toUpperCase()}</span>
			</button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="max-h-96 overflow-y-auto">
		{#each AVAILABLE_LANGUAGES as lang (lang.code)}
			<DropdownMenu.Item
				onclick={() => changeLanguage(lang)}
				class="gap-2"
				disabled={lang.code === persistedLocale.current}
			>
				<span class="text-lg" aria-hidden="true">{lang.flag}</span>
				<span class="flex-1">{lang.nativeName}</span>
				{#if lang.code === persistedLocale.current}
					<span class="text-muted-foreground text-xs">✓</span>
				{/if}
			</DropdownMenu.Item>
			{#if lang.code === 'pt'}
				<DropdownMenu.Separator />
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
