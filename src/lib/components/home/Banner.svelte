<script lang="ts">
	import { Trophy } from '@lucide/svelte';
</script>

<div
	class="w-full border-b border-red-100 bg-red-50/80 p-1 py-2 dark:border-red-800/30 dark:bg-red-900/20"
>
	<p
		class="flex items-center justify-center space-x-2 text-center text-sm font-medium text-red-700/90 dark:text-red-200/90"
	>
		<Trophy class="h-5 w-5 text-yellow-500" />
		<span
			>We won 4th place at Svelte Hack 2024! Check out our <a
				href="/changelog/timeline?highlight=svelte%20hack"
				class="underline">project timeline</a
			> for the full story.</span
		>
	</p>
</div>
