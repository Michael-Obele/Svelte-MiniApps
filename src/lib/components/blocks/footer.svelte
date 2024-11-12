<script lang="ts">
	import LightSwitch from '$lib/components/blocks/LightSwitch.svelte';
	import { scrollToTop } from '$lib/utils';
	import { Heart, MoveUp, ArrowUpFromDot, ArrowUp } from 'lucide-svelte';
</script>

<footer class="w-full bg-black py-5 text-center text-white md:py-10">
	<div class="container px-4 md:px-6">
		<!-- Existing Scroll to Top Button -->
		<div class="mx-auto mb-8 flex w-fit items-center justify-center space-x-3">
			<button
				class="mx-auto flex w-fit items-center space-x-2 rounded-md bg-white p-2 px-3 text-green-700 hover:bg-red-400 hover:text-white dark:bg-green-500 dark:text-black dark:hover:bg-green-400 dark:hover:text-black"
				on:click={scrollToTop}
			>
				Back to top
				<ArrowUp class="ml-2 size-5" />
			</button>
			<LightSwitch />
		</div>

		<!-- New Content: Made with Love and Installable Message -->
		<div class="mt-2 flex flex-col flex-wrap items-center justify-center gap-4">
			<span class="flex flex-row flex-wrap items-center justify-between space-x-4">
				<a
					href="https://github.com/Michael-Obele"
					target="_blank"
					rel="noopener noreferrer"
					class="flex flex-row items-center justify-between text-green-400 hover:text-green-300"
				>
					Made with
					<Heart size="20" class="mx-2 text-red-500" fill="red" />
					by <span class="ms-2 font-bold"> Michael </span>
				</a>
				<iframe
					src="https://github.com/sponsors/Michael-Obele/button"
					title="Sponsor Michael-Obele"
					height="32"
					width="114"
					style="border: 0; border-radius: 6px;"
				></iframe>
			</span>

			<p class="text-base text-gray-200">
				FYI: This app is <span class="font-semibold text-red-500">installable</span>.
			</p>
		</div>
	</div>
</footer>
