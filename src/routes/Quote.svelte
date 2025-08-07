<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { generateMantra } from '$lib/utility/greetings';

	let currentMantra = $state(generateMantra());

	function handleGenerate() {
		currentMantra = generateMantra();
	}
</script>

<div>
	<p>{currentMantra}</p>
	<button onclick={handleGenerate}>New Mantra</button>
</div>
