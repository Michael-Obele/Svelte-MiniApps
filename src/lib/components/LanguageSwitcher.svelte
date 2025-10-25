<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { AVAILABLE_LANGUAGES, getLanguage, type Language } from '$lib/languages';
	import { buttonVariants } from './ui/button';
	import { persistedLocale, changeLanguage } from '$lib/stores/language-store.svelte';

	// Derive current language from shared persisted state
	// This automatically updates across all component instances
	let currentLanguage = $derived(getLanguage(persistedLocale.current));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 {buttonVariants(
			{ variant: 'outline' }
		)}"
	>
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
			{#if lang.code === 'pt'}
				<DropdownMenu.Separator />
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
