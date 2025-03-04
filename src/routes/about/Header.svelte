<script lang="ts">
	import { onMount } from 'svelte';

	let { children, id } = $props();
	let stepperHeight = 0;

	onMount(() => {
		const stepperElement = document.getElementById('stepper');
		if (stepperElement) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						stepperHeight = stepperElement.offsetHeight;
						observer.disconnect();
					}
				});
			});
			observer.observe(stepperElement);
		}
	});

	function scrollToSection(event: Event) {
		// prevent default behavior
		event.preventDefault();
		const targetElement = document.getElementById(id);
		if (targetElement) {
			window.scrollTo({
				top: targetElement.offsetTop - stepperHeight,
				behavior: 'smooth'
			});
		}
	}
</script>

<header>
	<h2
		class="bold mx-auto my-5 mt-20 w-fit cursor-pointer text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
	>
		<a onclick={(event) => scrollToSection(event)} href="#{id}">
			{@render children?.()}
		</a>
	</h2>
</header>
