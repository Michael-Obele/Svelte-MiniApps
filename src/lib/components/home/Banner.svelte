<script lang="ts">
	import { Trophy, Link } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator';
</script>

<div class="relative w-full bg-slate-950 py-2 dark:bg-black">
	<p
		class="flex flex-col items-center justify-center gap-1 px-2 text-center text-xs font-medium text-slate-300 sm:flex-row sm:gap-2 sm:space-x-2 sm:text-sm dark:text-slate-400"
	>
		<Trophy class="h-4 w-4 shrink-0 text-red-500 sm:h-5 sm:w-5" />
		<span class="break-words"
			>Proud Winners of Svelte Hack 2025! Check out our <a
				href="/changelog/timeline"
				class="whitespace-nowrap text-white underline decoration-red-500/50 underline-offset-4 hover:decoration-red-500 dark:text-slate-200"
				>2025 Timeline</a
			>
			<Link class="inline h-3 w-3" /></span
		>
	</p>
	<Separator
		class="absolute bottom-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
	/>
</div>
