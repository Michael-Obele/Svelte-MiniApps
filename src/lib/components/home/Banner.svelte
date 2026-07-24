<!--
@component

Banner — slim, dismissable trust bar that replaces the prior full-width banner.

Storing dismissal in localStorage means the user only sees it once per device
(loss-aversion signal preserved, conversion real estate reclaimed).

-->

<script lang="ts">
	import { Trophy, X, ChevronRight } from '@lucide/svelte';

	const STORAGE_KEY = 'banner:svelte-hack-2025:dismissed';

	let dismissed = $state(false);

	// Hydrate from storage on the client. Guarded for SSR / private mode.
	$effect(() => {
		try {
			dismissed = localStorage.getItem(STORAGE_KEY) === '1';
		} catch {
			dismissed = false;
		}
	});

	function handleDismiss() {
		dismissed = true;
		try {
			localStorage.setItem(STORAGE_KEY, '1');
		} catch {
			// Best-effort; ignore write failures.
		}
	}
</script>

{#if !dismissed}
	<div
		class="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur"
	>
		<div
			class="text-muted-foreground mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1.5 text-xs sm:text-sm"
		>
			<a
				href="/changelog/timeline"
				class="hover:text-foreground flex min-w-0 flex-1 items-center gap-2 truncate"
			>
				<Trophy class="h-3.5 w-3.5 shrink-0 text-amber-500 sm:h-4 sm:w-4" />
				<span class="truncate">
					<span class="text-foreground font-medium">Svelte Hack 2025 winner</span>
					<span class="text-muted-foreground hidden sm:inline">— see how we built it</span>
				</span>
				<ChevronRight class="h-3.5 w-3.5 shrink-0" />
			</a>
			<button
				type="button"
				onclick={handleDismiss}
				aria-label="Dismiss banner"
				class="hover:bg-muted shrink-0 rounded-md p-1 transition-colors"
			>
				<X class="h-3.5 w-3.5" />
			</button>
		</div>
	</div>
{/if}
