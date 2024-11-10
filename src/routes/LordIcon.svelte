<script lang="ts">
	interface Props {
		src: string;
		trigger?: string; // Default trigger
		colors?: string; // Default colors
		dir?: 'left' | 'right';
	}

	let {
		src,
		trigger = 'loop-on-hover',
		colors = 'primary:red,secondary:green',
		dir = 'right'
	}: Props = $props();
</script>

<lord-icon
	target="div"
	src="https://cdn.lordicon.com/{src}.json"
	{colors}
	{trigger}
	class="{dir === 'left' ? 'float-left' : 'float-right'} m-3 h-16 w-16 pt-5 md:h-24 md:w-24"
></lord-icon>
