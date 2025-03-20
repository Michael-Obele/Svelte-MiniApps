<script lang="ts">
	import { FlexiResize } from 'svelte-flexiboards';
	
	let { size = 24, class: className = '' } = $props<{
		size?: number;
		class?: string;
	}>();
</script>

<FlexiResize>
	<div class={`${className}`}>
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
			class="lucide lucide-move-horizontal"
		>
			<polyline points="18 8 22 12 18 16" />
			<polyline points="6 8 2 12 6 16" />
			<line x1="2" x2="22" y1="12" y2="12" />
		</svg>
	</div>
</FlexiResize>
