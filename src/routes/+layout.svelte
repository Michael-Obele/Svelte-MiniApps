 <script lang="ts">
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { Download } from 'lucide-svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { afterUpdate, onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';
	import { partytownSnippet } from '@builder.io/partytown/integration';
	import Footer from '$lib/components/footer.svelte';

	let updateAvailable = false;

	let registration: ServiceWorkerRegistration; // Store the registration globally

	async function detectSWUpdate() {
		try {
			registration = await navigator.serviceWorker.ready;

			registration.addEventListener('updatefound', () => {
				// We'll prompt the user as soon as 'updatefound' is fired
				if (registration.installing) {
					updateAvailable = true;
				}
			});
		} catch (error) {
			console.error('Service worker registration failed:', error);
		}
	}

	onMount(() => {
		detectSWUpdate();
	});

	onMount(() => {
		setTimeout(() => {
			const script = document.createElement('script');
			script.src = 'https://cdn.lordicon.com/lordicon.js';
			document.body.appendChild(script);
		}, 3000);
	});

	$: userData = '';
</script>

<svelte:head>
	<title>Svelte MiniApps</title>
	<script>
		// Forward the necessary functions to the web worker layer
		partytown = {
			forward: ['dataLayer.push', 'gtag']
		};
	</script>

	{@html '<script>' + partytownSnippet() + '</script>'}

	<script
		type="text/partytown"
		src="https://www.googletagmanager.com/gtag/js?id=G-3QH4C3V22M"
	></script>
	<script type="text/partytown">
		window.dataLayer = window.dataLayer || [];
		window.gtag = function () {
			dataLayer.push(arguments);
		};
		gtag('js', new Date());
		gtag('config', 'G-3QH4C3V22M');
	</script>
</svelte:head>

<ModeWatcher />

<Navbar {userData} />

<Toaster />

<slot class="text-gray-900 dark:text-white" />

<Footer />

<!--
	<script type="application/ld+json">
	{{
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": [{
			"@type": "Question",
			"name": "What is Svelte MiniApps?",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "Svelte MiniApps is a collection of useful and engaging tools built with Svelte."
			}
		}, {
			"@type": "Question",
			"name": "How can I use Svelte MiniApps?",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "You can use Svelte MiniApps by visiting our website and choosing the tool you want to use."
			}
		}, {
			"@type": "Question",
			"name": "Is Svelte MiniApps installable?",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "Yes, Svelte MiniApps is a Progressive Web App (PWA) and can be installed on your device for offline use."
			}
		}, {
			"@type": "Question",
			"name": "Is Svelte MiniApps open source?",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "Yes, Svelte MiniApps is open source. You can view and contribute to the source code on our GitHub repository."
			}
		},
		{
    "@type": "Question",
    "name": "Is the web app installable and how can I install it?",
    "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the web app is installable as it's a Progressive Web App (PWA). On Chrome, click on the three-dot menu in the top-right corner, then click on 'Install App'. On Safari, tap the Share button, then tap 'Add to Home Screen'."
    }
},
 {
        "@type": "Question",
        "name": "Where can I learn more about Svelte?",
        "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can learn more about Svelte by visiting the official Svelte website at https://svelte.dev/. They have a comprehensive guide and tutorial that can help you get started with Svelte."
        }
    }]
	}}
	</script>

-->
