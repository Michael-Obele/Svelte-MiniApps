<script lang="ts">
	import { Trophy, Link } from '@lucide/svelte';
</script>

<div
	class="w-full border-b border-red-100 bg-red-50/80 p-1 py-2 dark:border-red-800/30 dark:bg-red-900/20"
>
	<p
		class="flex flex-col items-center justify-center gap-1 px-2 text-center text-xs font-medium text-red-700/90 sm:flex-row sm:gap-2 sm:space-x-2 sm:text-sm dark:text-red-200/90"
	>
		<Trophy class="h-4 w-4 shrink-0 text-yellow-500 sm:h-5 sm:w-5" />
		<span class="break-words"
			>4th place at Svelte Hack 2024! See our <a
				href="/changelog/timeline?highlight=svelte%20hack"
				class="whitespace-nowrap underline">Svelte Hack timeline</a
			>
			<Link class="inline h-3 w-3" /></span
		>
	</p>
</div>
