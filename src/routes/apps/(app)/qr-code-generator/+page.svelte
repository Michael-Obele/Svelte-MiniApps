<script lang="ts">
	import { QRCodeImage } from 'svelte-qrcode-image';
	import * as htmlToImage from 'html-to-image';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getContext } from 'svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';

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

	$effect(() => {
		if (selectedTab === 'contact') {
			inputText = generateVCard();
		} else if (selectedTab === 'social') {
			inputText = generateSocialLinks();
		}
	});

	function generateSocialLinks() {
		const validLinks = socialLinks.filter(link => link.label && link.url);
		if (validLinks.length === 0) return '';

		let text = 'My Social Links:\n\n';
		validLinks.forEach(link => {
			text += `${link.label}: ${link.url}\n`;
		});
		return text;
	}

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
				Create QR codes for text, URLs, contact information, and social media links. Download instantly.
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
						<div class="space-y-4">
							<div class="space-y-2">
								<Label for="text-input">Enter Text or URL</Label>
								<Input
									id="text-input"
									type="text"
									placeholder="Enter text or paste a URL"
									bind:value={inputText}
								/>
							</div>
						</div>
					</Tabs.Content>
					<Tabs.Content value="contact">
						<div class="grid gap-4">
							<div class="space-y-2">
								<Label for="name">Full Name</Label>
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									bind:value={contactInfo.name}
								/>
							</div>
							<div class="space-y-2">
								<Label for="phone">Phone Number</Label>
								<Input
									id="phone"
									type="tel"
									placeholder="+1234567890"
									bind:value={contactInfo.phone}
								/>
							</div>
							<div class="space-y-2">
								<Label for="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="john@example.com"
									bind:value={contactInfo.email}
								/>
							</div>
							<div class="space-y-2">
								<Label for="website">Website</Label>
								<Input
									id="website"
									type="url"
									placeholder="https://example.com"
									bind:value={contactInfo.website}
								/>
							</div>
						</div>
					</Tabs.Content>
					<Tabs.Content value="social">
						<div class="space-y-4">
							{#each socialLinks as link, i}
								<div class="flex gap-4">
									<div class="flex-1 space-y-2">
										<Label for="social-label-{i}">Link Label</Label>
										<Input
											id="social-label-{i}"
											type="text"
											placeholder="Instagram, Twitter, Portfolio, etc."
											bind:value={link.label}
										/>
									</div>
									<div class="flex-1 space-y-2">
										<Label for="social-url-{i}">URL</Label>
										<Input
											id="social-url-{i}"
											type="url"
											placeholder="https://..."
											bind:value={link.url}
										/>
									</div>
										<Button
											variant="destructive"
											class="mt-8 {socialLinks.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
											disabled={socialLinks.length === 1}
											onclick={() => removeSocialLink(i)}
										>
											Remove
										</Button>
								</div>
							{/each}
							<Button variant="outline" class="w-full" onclick={addSocialLink}>
								Add Another Link
							</Button>
						</div>
					</Tabs.Content>
				</div>
			</Tabs.Root>

			{#if inputText}
				<div class="mt-6 flex flex-col items-center justify-center space-y-4">
					<AlertDialog.Root>
						<AlertDialog.Trigger>
							<div class="cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:shadow-md">
								<QRCodeImage
									text={inputText}
									displayID="qr-code-image"
									displayClass="h-64 w-64 rounded-md"
								/>
							</div>
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Your QR Code</AlertDialog.Title>
								<AlertDialog.Description>
									<div class="mt-4 flex justify-center">
										<QRCodeImage
											text={inputText}
											displayClass="h-96 w-96 rounded-md"
										/>
									</div>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Close</AlertDialog.Cancel>
								<Button onclick={saveQRCode} variant="default">
									Download
								</Button>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>

					<Button
						onclick={saveQRCode}
						size="lg"
						class="w-full max-w-sm"
					>
						Download QR Code
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
