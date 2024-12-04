<script lang="ts">
	import * as htmlToImage from 'html-to-image';
	import TextInput from './TextInput.svelte';
	import ContactInput from './ContactInput.svelte';
	import SocialLinks from './SocialLinks.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import QRCodeDisplay from './QRCodeDisplay.svelte';

	let inputText = $state('');
	let selectedTab = $state('text');
	let contactInfo = $state({
		name: '',
		phone: '',
		email: '',
		website: ''
	});
	let socialLinks = $state([
		{ label: '', url: '' }
	]);

	function addSocialLink() {
		socialLinks = [...socialLinks, { label: '', url: '' }];
	}

	function removeSocialLink(index: number) {
		socialLinks = socialLinks.filter((_, i) => i !== index);
	}

	function generateSocialLinks() {
		const validLinks = socialLinks.filter(link => link.label && link.url);
		if (validLinks.length === 0) return '';

		let text = 'My Social Links:\n\n';
		validLinks.forEach(link => {
			const safeUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
			text += `${link.label}: ${safeUrl}\n`;
		});
		return text;
	}

	$effect(() => {
		if (selectedTab === 'contact') {
			inputText = generateVCard();
		} else if (selectedTab === 'social') {
			inputText = generateSocialLinks();
		}
	});

	function generateVCard() {
		if (!contactInfo.name && !contactInfo.phone && !contactInfo.email && !contactInfo.website) return '';
		
		let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
		if (contactInfo.name) vcard += `FN:${contactInfo.name}\n`;
		if (contactInfo.phone) vcard += `TEL:${contactInfo.phone}\n`;
		if (contactInfo.email) vcard += `EMAIL:${contactInfo.email}\n`;
		if (contactInfo.website) vcard += `URL:${contactInfo.website}\n`;
		vcard += 'END:VCARD';
		return vcard;
	}

	async function saveQRCode() {
		if (!inputText) return;
		const qrCodeElement = document.getElementById('qr-code-image') as HTMLElement;
		if (!qrCodeElement) return;

		try {
			const dataUrl = await htmlToImage.toPng(qrCodeElement);
			const link = document.createElement('a');
			link.download = 'qr-code.png';
			link.href = dataUrl;
			link.click();
		} catch (error) {
			console.error('Error saving QR code:', error);
		}
	}
</script>

<svelte:head>
	<title>QR Code Generator</title>
	<meta
		name="description"
		content="Generate and download QR codes for links, contact info, or any data you want to embed."
	/>
	<meta name="keywords" content="QR Code, QR Code Generator, Encode QR, Save QR" />
</svelte:head>

<section class="container mx-auto py-8">
	<div class="mx-auto max-w-4xl space-y-8">
		<div class="text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight">QR Code Generator</h1>
			<p class="text-lg text-muted-foreground">
				Create QR codes for text, URLs, contact information, and more. Download instantly.
			</p>
		</div>

		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<Tabs.Root value={selectedTab} onValueChange={(v) => selectedTab = v} class="w-full">
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="text">Text/URL</Tabs.Trigger>
					<Tabs.Trigger value="contact">Contact Card</Tabs.Trigger>
					<Tabs.Trigger value="social">Social Links</Tabs.Trigger>
				</Tabs.List>
				<div class="mt-6 space-y-4">
					<Tabs.Content value="text">
						<TextInput bind:inputText={inputText} />
					</Tabs.Content>
					<Tabs.Content value="contact">
						<ContactInput bind:contactInfo={contactInfo} />
					</Tabs.Content>
					<Tabs.Content value="social">
						<SocialLinks bind:socialLinks={socialLinks} addSocialLink={addSocialLink} removeSocialLink={removeSocialLink} />
					</Tabs.Content>
				</div>
			</Tabs.Root>

			{#if inputText}
				<div class="mt-6 flex flex-col items-center justify-center space-y-4">
					<QRCodeDisplay {inputText} {saveQRCode} />
				</div>
			{/if}
		</div>
	</div>
</section>
