<script lang="ts">
	import { FlexiGrab } from 'svelte-flexiboards';
	
	let { size = 24, class: className = '' } = $props<{
		size?: number;
		class?: string;
	}>();
</script>

<FlexiGrab>
	<div class={`cursor-grab ${className}`}>
		<svg 
			xmlns="http://www.w3.org/2000/svg" 
			width={size} 
			height={size} 
			viewBox="0 0 24 24" 
			fill="none" 
			stroke="currentColor" 
			stroke-width="2" 
			stroke-linecap="round" 
			stroke-linejoin="round" 
			class="lucide lucide-grip-vertical"
		>
			<circle cx="9" cy="12" r="1" />
			<circle cx="9" cy="5" r="1" />
			<circle cx="9" cy="19" r="1" />
			<circle cx="15" cy="12" r="1" />
			<circle cx="15" cy="5" r="1" />
			<circle cx="15" cy="19" r="1" />
		</svg>
	</div>
</FlexiGrab>
