<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// we need a way to get the current date the user was born
	// the year, month and day
	// 4 digits for the year
	let year: number = 1900;
	// 0-12
	let month: number = 0;
	// 0-31
	let day: number = 0;
</script>
