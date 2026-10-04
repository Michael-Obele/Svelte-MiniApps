<script lang="ts">
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { AVAILABLE_LANGUAGES, getLanguage, type Language } from '#lib/languages.js';
	import { buttonVariants, type ButtonVariant } from '../ui/button';
	import { persistedLocale, changeLanguage } from '#lib/stores/language-store.svelte.js';

	// Defaults to `outline` so existing call sites (e.g. the footer) keep their look.
	let { variant = 'outline' }: { variant?: ButtonVariant } = $props();

	// Derive current language from shared persisted state
	// This automatically updates across all component instances
	let currentLanguage = $derived(getLanguage(persistedLocale.current));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant, size: 'sm' })}>
		<span class="text-lg" aria-hidden="true">{currentLanguage?.flag}</span>
		<span class="hidden sm:inline">{currentLanguage?.nativeName}</span>
		<span class="sm:hidden">{currentLanguage?.code.toUpperCase()}</span>
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
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
