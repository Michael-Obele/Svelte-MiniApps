<script lang="ts">
	import { Editor, Toolbar, Preview } from '$lib/components/markdown';
	import FeatureFlag from '@/components/blocks/FeatureFlag.svelte';
	import UnderConstruction from '@/components/blocks/UnderConstruction.svelte';
	import { marked } from 'marked';

	let value = $state('');
	let renderHTML = $derived(marked.parse(value));

	const handleInput = (newValue: string) => {
		value = newValue;
	};
</script>

<UnderConstruction link={false} />

<FeatureFlag>
	<div class="flex flex-col md:flex-row">
		<div class="md:w-1/2">
			<Toolbar bind:value />
			<Editor bind:value onInput={handleInput} />
		</div>
		<div class="md:w-1/2">
			<Preview html={renderHTML} />
		</div>
	</div>
</FeatureFlag>
