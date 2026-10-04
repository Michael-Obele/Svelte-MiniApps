<script lang="ts">
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';

	import { toggleMode } from 'mode-watcher';
	import { Button, type ButtonVariant } from '@/ui/button/index.js';

	// Defaults to `outline` so existing call sites (e.g. the footer) keep their look.
	let { variant = 'outline' }: { variant?: ButtonVariant } = $props();
</script>

<Button onclick={toggleMode} {variant} size="icon">
	<Sun
		class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 text-black transition-all dark:scale-0 dark:-rotate-90"
	/>
	<Moon
		class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
