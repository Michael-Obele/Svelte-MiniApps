<script lang="ts">
	import { browser } from '$app/environment';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { AVAILABLE_LANGUAGES, getLanguage, type Language } from '$lib/languages';
	import { useSearchParams } from 'runed/kit';
	import * as v from 'valibot';

	// Define valid language codes as a union type for type safety
	const validLanguageCodes = AVAILABLE_LANGUAGES.map((lang) => lang.code);

	// Define Valibot schema for URL search params with validation
	const localeSchema = v.object({
		locale: v.optional(
			v.fallback(
				v.pipe(
					v.string(),
					v.check((code) => validLanguageCodes.includes(code), 'Invalid language code')
				),
				'en'
			),
			'en'
		)
	});

	// Create reactive search params that sync with URL
	const params = useSearchParams(localeSchema, {
		pushHistory: false, // Replace state instead of creating new history entries
		debounce: 0, // No debounce needed for language switching
		noScroll: true, // Don't scroll to top when switching languages
		showDefaults: false // Don't show 'en' in URL when it's the default
	});

	// Derive current language from URL params with guaranteed valid language
	let currentLanguage = $derived(getLanguage(params.locale));

	/**
	 * Change the application language
	 * Updates URL params, document attributes, and reloads the page
	 * @param lang - Language object to switch to
	 */
	function changeLanguage(lang: Language) {
		if (!browser) return;

		// Update URL search params (automatically updates URL and validates)
		params.locale = lang.code;

		// Update document attributes for accessibility and RTL support
		if (document.documentElement) {
			document.documentElement.dir = lang.dir || 'ltr';
			document.documentElement.lang = lang.code;
		}

		// Reload page to ensure all translations are loaded
		// Note: This ensures server-side rendered content matches the selected language
		window.location.reload();
	}

	// Apply document settings reactively when locale changes
	// $effect(() => {
	// 	if (browser && currentLanguage) {
	// 		if (document.documentElement) {
	// 			document.documentElement.dir = currentLanguage.dir || 'ltr';
	// 			document.documentElement.lang = currentLanguage.code;
	// 		}
	// 	}
	// });
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
				disabled={lang.code === params.locale}
			>
				<span class="text-lg" aria-hidden="true">{lang.flag}</span>
				<span class="flex-1">{lang.nativeName}</span>
				{#if lang.code === params.locale}
					<span class="text-muted-foreground text-xs">✓</span>
				{/if}
			</DropdownMenu.Item>
			{#if lang.code === 'pt'}
				<DropdownMenu.Separator />
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
