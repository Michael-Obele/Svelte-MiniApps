<script lang="ts">
	import { run } from 'svelte/legacy';

	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Slider } from "$lib/components/ui/slider";
	import { Switch } from "$lib/components/ui/switch";
	import { Label } from "$lib/components/ui/label";
	import { Progress } from "$lib/components/ui/progress";
	import { toast } from "svelte-sonner";
	import { Copy, RefreshCw } from "lucide-svelte";
	import { siteimage, siteurl, sitename } from '$lib';
	import { fade } from "svelte/transition";

	let password = $state('');
	let passwordLength = $state(12);
	let includeUppercase = $state(true);
	let includeLowercase = $state(true);
	let includeNumbers = $state(true);
	let includeSymbols = $state(true);
	let passwordStrength = $state(0);

	const generatePassword = () => {
		const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const lowercase = 'abcdefghijklmnopqrstuvwxyz';
		const numbers = '0123456789';
		const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

		let chars = '';
		if (includeUppercase) chars += uppercase;
		if (includeLowercase) chars += lowercase;
		if (includeNumbers) chars += numbers;
		if (includeSymbols) chars += symbols;

		if (!chars) {
			toast.error('Please select at least one character type');
			return;
		}

		let result = '';
		for (let i = 0; i < passwordLength; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		password = result;
		calculateStrength();
	};

	const calculateStrength = () => {
		let strength = 0;
		if (password.length >= 12) strength += 25;
		if (includeUppercase && /[A-Z]/.test(password)) strength += 25;
		if (includeLowercase && /[a-z]/.test(password)) strength += 25;
		if (includeNumbers && /\d/.test(password)) strength += 12.5;
		if (includeSymbols && /[^A-Za-z0-9]/.test(password)) strength += 12.5;
		passwordStrength = strength;
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(password);
			toast.success('Password copied to clipboard');
		} catch (err) {
			toast.error('Failed to copy password');
		}
	};

	$effect(() => {
		if (password) calculateStrength();
	});
</script>

<svelte:head>
	<title>Svelte MiniApps - Password Generator</title>
	<meta
		name="description"
		content="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	/>
	<meta property="og:title" content="Svelte MiniApps - Password Generator" />
	<meta
		property="og:description"
		content="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	/>
	<meta property="og:url" content="https://svelte-apps.me/apps/password-generator" />
	<meta property="og:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Svelte MiniApps - Password Generator - Secure Your Accounts"
	/>
	<meta
		name="twitter:description"
		content="Generate strong, random passwords with ease using the Svelte MiniApps Random Password Generator."
	/>
	<meta name="twitter:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />

	<link rel="canonical" href="https://svelte-apps.me/apps/password-generator" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="UTF-8" />
	<meta name="robots" content="index, follow" />
	<script type="application/ld+json">
		{
			"@context": "http://schema.org",
			"@type": "WebApplication",
			"name": "Svelte MiniApps - Password Generator",
			"url": "https://svelte-apps.me/apps/password-generator",
			"description": "Generates random passwords with configurable length and complexity. Secure your accounts with ease."
		}
	</script>
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Password Generator</h1>
			<p class="text-muted-foreground">Generate secure, random passwords instantly</p>
		</div>

		<div class="space-y-4 rounded-lg border bg-card p-6">
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<Input
						type="text"
						value={password}
						placeholder="Your password will appear here"
						readonly
						class="font-mono text-lg"
					/>
					<Button variant="outline" size="icon" onclick={copyToClipboard} disabled={!password}>
						<Copy class="h-4 w-4" />
					</Button>
					<Button variant="outline" size="icon" onclick={generatePassword}>
						<RefreshCw class="h-4 w-4" />
					</Button>
				</div>

				{#if password}
					<div transition:fade>
						<Progress value={passwordStrength} class="h-2" />
						<p class="mt-1 text-sm text-muted-foreground">
							Password Strength: {passwordStrength}%
						</p>
					</div>
				{/if}
			</div>

			<div class="space-y-4">
				<div class="space-y-2">
					<!-- <Label>Password Length: {passwordLength}</Label> -->
					<!-- <Slider
						bind:value={passwordLength}
						min={8}
						max={32}
						step={1}
					/> -->
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="flex items-center justify-between">
						<Label>Uppercase Letters</Label>
						<Switch bind:checked={includeUppercase} />
					</div>
					<div class="flex items-center justify-between">
						<Label>Lowercase Letters</Label>
						<Switch bind:checked={includeLowercase} />
					</div>
					<div class="flex items-center justify-between">
						<Label>Numbers</Label>
						<Switch bind:checked={includeNumbers} />
					</div>
					<div class="flex items-center justify-between">
						<Label>Special Characters</Label>
						<Switch bind:checked={includeSymbols} />
					</div>
				</div>

				<Button class="w-full" onclick={generatePassword}>Generate Password</Button>
			</div>
		</div>
	</div>
</div>
