<script lang="ts">
	import { Button } from '@/ui/button';
	import { site } from '$lib/index.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import type { PageProps } from './$types';
	import { PasswordDisplay } from './components';
	import { getSavedPasswords, getCurrentUser } from '$lib/remote';
	import HowToUseDialog from '@/blocks/HowToUseDialog.svelte';
	import { randomPasswordGeneratorHowToUse } from './how-to-use-config';
	import { HelpCircle, ExternalLink } from '@lucide/svelte';
	import { PersistedState } from '$lib/persisted-state';
	import { ScrollArea } from '@/ui/scroll-area';
	import PasswordGenerator from '$lib/components/password/PasswordGenerator.svelte';

	type PasswordRecord = {
		id: string;
		createdAt: Date;
		passwordHash: string;
		details: string | null;
	};

	// View toggle for the saved-passwords panel. Everything else (user, list)
	// comes from the project's standard remote-query pattern: awaited directly
	// in markup so the query's built-in loading + dedup + refresh state is
	// used instead of a manual `$effect` + `$state` pair.
	let viewing = $state(false);
	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState('random-password-generator-has-seen-how-to-use', false);
</script>

<RouteHead
	title="{site().name} - Password Generator"
	description="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	keywords="password generator, secure passwords, random passwords, password security, svelte apps"
	route="/apps/password-generator"
	image={site().image}
/>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="space-y-6">
		<div class="space-y-2 text-center">
			<div class="flex items-center justify-center gap-4">
				<h1 class="text-3xl font-bold">Password Generator</h1>
				<Button
					variant="outline"
					size="icon"
					onclick={() => (showHowToUse = true)}
					class="shrink-0"
				>
					<HelpCircle class="h-4 w-4" />
				</Button>
			</div>
			<p class="text-muted-foreground">Generate secure, random passwords instantly</p>
		</div>

		<div class="bg-card space-y-4 rounded-lg border p-6">
			<!--
			  Generation core: full app UI. The same component is shown on
			  the homepage as a live preview, so the visitor already knows
			  the controls by the time they reach this page.
			-->
			<PasswordGenerator />
		</div>

		<!--
		  Saved passwords section.
		  `getCurrentUser()` is awaited as a block (mirrors the `passwords/+page.svelte`
		  pattern, which uses `{#await getSavedPasswords()}`). The query has its
		  own loading + dedup + refresh state — we just consume the result.

		  Block-level `{#await}` is the supported place to await remote queries
		  in markup; inline `{#if (await ...)}` is rejected by the compiler
		  under the experimental.async flag.
		-->
		{#await getCurrentUser() then user}
			{#if user?.username}
				<div class="flex gap-3 pt-2">
					<Button onclick={() => (viewing = !viewing)} variant="secondary" class="h-11 flex-1">
						<span class="hidden sm:inline">
							{viewing ? 'Hide Saved Passwords' : 'View Saved Passwords'}
						</span>
						<span class="sm:hidden">Saved</span>
					</Button>
					<Button
						href="/apps/random-password-generator/passwords"
						variant="outline"
						size="lg"
						title="View all passwords"
						class="size-11"
					>
						<ExternalLink class="h-5 w-5" />
					</Button>
				</div>

				{#if viewing}
					<!--
					  Await the saved-passwords query directly. Same pattern
					  as the full passwords list page — behaviour and
					  loading states stay consistent across both surfaces.
					-->
					{#await getSavedPasswords()}
						<div class="mt-6 space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-semibold">Saved Passwords</h3>
							</div>
							<div class="flex items-center justify-center py-8">
								<div
									class="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
								></div>
							</div>
						</div>
					{:then passwords}
						<div class="mt-6 space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-semibold">
									Saved Passwords
									<span class="text-muted-foreground text-sm font-normal">
										({passwords.length})
									</span>
								</h3>
								<Button
									onclick={() => (viewing = false)}
									variant="ghost"
									size="sm"
									class="text-muted-foreground hover:text-foreground"
								>
									Hide
								</Button>
							</div>
							<ScrollArea class="bg-muted/20 h-[400px] w-full rounded-lg border p-4">
								<div class="space-y-3">
									{#each passwords as savedPassword (savedPassword.id)}
										<PasswordDisplay password={savedPassword} />
									{:else}
										<div class="py-8 text-center">
											<p class="mb-2 text-muted-foreground">No saved passwords yet</p>
											<p class="text-sm text-muted-foreground">
												Generate and save your first password above
											</p>
										</div>
									{/each}
								</div>
							</ScrollArea>
						</div>
					{:catch error}
						<p class="text-destructive mt-6 text-sm">
							{error instanceof Error ? error.message : 'Failed to load saved passwords'}
						</p>
					{/await}
				{/if}
			{/if}
		{:catch}
			<!-- User query failed; treat as unauthenticated and skip the section. -->
		{/await}
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={randomPasswordGeneratorHowToUse.title}
	description={randomPasswordGeneratorHowToUse.description}
	tabs={randomPasswordGeneratorHowToUse.tabs}
	showFooterHelpText={randomPasswordGeneratorHowToUse.showFooterHelpText}
/>
