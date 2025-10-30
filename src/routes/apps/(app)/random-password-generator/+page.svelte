<script lang="ts">
	import { Button, buttonVariants } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Slider } from '@/ui/slider';
	import { Switch } from '@/ui/switch';
	import { Label } from '@/ui/label';
	import { Progress } from '@/ui/progress';
	import { toast } from 'svelte-sonner';
	import { Copy, Star, StarOff, Check, ExternalLink } from '@lucide/svelte';
	import { site } from '$lib/index.svelte';
	import { fade } from 'svelte/transition';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { copyToClipboard } from '$lib/utils';
	import type { PageProps } from './$types';
	import { Skeleton } from '@/ui/skeleton';
	import PasswordDisplay from './PasswordDisplay.svelte';
	import { getSavedPasswords, savePassword, getCurrentUser } from '$lib/remote';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { randomPasswordGeneratorHowToUse } from './how-to-use-config';
	import { HelpCircle } from '@lucide/svelte';
	import { PersistedState } from 'runed';
	import * as Popover from '@/ui/popover';
	import { onMount } from 'svelte';
	import { ScrollArea } from '@/ui/scroll-area';

	// Define User type inline to match what getCurrentUser returns
	type User = {
		id: string;
		username: string;
		role: string;
		createdAt: Date;
	};

	type PasswordRecord = {
		id: string;
		createdAt: Date;
		passwordHash: string;
		details: string | null;
	};

	let { data }: PageProps = $props();

	let password = $state('');
	let passwordLength = $state(12);
	let includeUppercase = $state(true);
	let includeLowercase = $state(true);
	let includeNumbers = $state(true);
	let includeSymbols = $state(true);
	let isSaved = $state(false);
	let viewing = $state(false);
	let saving = $state(false);

	let copySuccess = $state(false);
	let savedPasswords = $state<PasswordRecord[] | null>(null);
	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState('random-password-generator-has-seen-how-to-use', false);
	let showSavePopover = $state(false);
	let passwordDetails = $state('');

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

		if (result) {
			isSaved = false;
		}
	};

	// Automatically calculate password strength when password or options change
	let passwordStrength = $derived.by(() => {
		if (!password) return 0;
		let strength = 0;
		if (password.length >= 12) strength += 25;
		if (includeUppercase && /[A-Z]/.test(password)) strength += 25;
		if (includeLowercase && /[a-z]/.test(password)) strength += 25;
		if (includeNumbers && /\d/.test(password)) strength += 12.5;
		if (includeSymbols && /[^A-Za-z0-9]/.test(password)) strength += 12.5;
		return strength;
	});

	const getStrengthColor = (strength: number): string => {
		if (strength <= 25) return 'bg-red-500';
		if (strength <= 50) return 'bg-orange-500';
		if (strength <= 75) return 'bg-yellow-500';
		return 'bg-green-500';
	};

	async function handleCopy() {
		await copyToClipboard(
			password,
			'Password copied to clipboard',
			'Failed to copy password',
			() => {
				// Success callback - show check icon
				copySuccess = true;
				setTimeout(() => {
					copySuccess = false;
				}, 2000); // Hide check icon after 2 seconds
			}
		);
	}

	async function handleSave() {
		if (saving || !currentUser || !password) return;

		try {
			saving = true;
			await savePassword({ password, details: passwordDetails || null });
			await getSavedPasswords().refresh();
			savedPasswords = await getSavedPasswords();
			toast.success('Password saved successfully!');
			showSavePopover = false;
			passwordDetails = '';
		} catch (error) {
			console.error('Error saving password:', error);
			toast.error('Failed to save password');
		} finally {
			saving = false;
			isSaved = true;
		}
	}

	async function handleView() {
		if (viewing) return;

		try {
			viewing = true;
			if (!savedPasswords) {
				savedPasswords = await getSavedPasswords();
			}
		} catch (error) {
			console.error('Error viewing passwords:', error);
			toast.error('Failed to load saved passwords');
		}
	}



	// Use effect to get current user asynchronously
	let currentUser = $state<User | null>(null);
	onMount(() => {
		getCurrentUser().then((user) => {
			currentUser = user;
		});
	});
</script>

<RouteHead
	title="{site().name} - Password Generator"
	description="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	keywords="password generator, secure passwords, random passwords, password security, svelte apps"
	route="/apps/password-generator"
	image={site().image}
/>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="space-y-6">
		<div class="space-y-2 text-center">
			<div class="flex items-center justify-center gap-4">
				<h1 class="text-3xl font-bold">Password Generator</h1>
				<Button
					variant="outline"
					size="icon"
					onclick={() => (showHowToUse = true)}
					class="shrink-0"
				>
					<HelpCircle class="h-4 w-4" />
				</Button>
			</div>
			<p class="text-muted-foreground">Generate secure, random passwords instantly</p>
		</div>

		<div class="bg-card space-y-4 rounded-lg border p-6">
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<Popover.Root bind:open={showSavePopover}>
						{#if !saving}
							<Popover.Trigger
								class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-10 items-center justify-center gap-2 rounded-md border text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
								disabled={!currentUser || !password}
							>
								<Star class="h-4 w-4 {isSaved ? 'fill-current' : ''}" />
							</Popover.Trigger>
						{:else}
							<div class="flex size-10 items-center justify-center rounded-md border">
								<div
									class="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
								></div>
							</div>
						{/if}
						<Popover.Content class="w-80">
							<div class="grid gap-4">
								<div class="space-y-2">
									<h4 class="leading-none font-medium">Save Password</h4>
									<p class="text-muted-foreground text-sm">
										Add an optional description to help you remember what this password is for.
									</p>
								</div>
								<div class="grid gap-2">
									<Label for="password-details">Description (Optional)</Label>
									<Input
										id="password-details"
										bind:value={passwordDetails}
										placeholder="e.g., My email account, Work laptop..."
										maxlength={200}
									/>
									<p class="text-muted-foreground text-xs">
										{passwordDetails.length}/200 characters
									</p>
								</div>
								<div class="flex gap-2">
									<Button
										variant="outline"
										class="flex-1"
										onclick={() => (showSavePopover = false)}
									>
										Cancel
									</Button>
									<Button onclick={handleSave} disabled={saving} class="flex-1">
										{#if saving}
											<div
												class="mr-2 size-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"
											></div>
										{/if}
										Save
									</Button>
								</div>
							</div>
						</Popover.Content>
					</Popover.Root>

					<Input
						type="text"
						value={password}
						placeholder="Your password will appear here"
						readonly
						class="font-mono text-lg"
					/>
					<Button
						variant="outline"
						size="icon"
						onclick={handleCopy}
						disabled={!password}
						class={copySuccess ? 'border-green-500 bg-green-50 text-green-600' : ''}
					>
						{#if copySuccess}
							<Check class="h-4 w-4" />
						{:else}
							<Copy class="h-4 w-4" />
						{/if}
					</Button>
				</div>

				{#if password}
					<div transition:fade>
						<Progress
							value={passwordStrength}
							class="h-2 transition-all duration-300 ease-out"
							classInner={getStrengthColor(passwordStrength)}
						/>
						<p class="text-muted-foreground my-4 text-sm">
							Password Strength: {Math.round(passwordStrength)}%
						</p>
					</div>
				{/if}
			</div>

			<div class="space-y-4">
				<div class="space-y-4">
					<Label for="passwordLength">Password Length: {passwordLength}</Label>
					<Slider
						id="passwordLength"
						bind:value={passwordLength}
						min={8}
						max={32}
						step={1}
						type="single"
						class="my-5"
					/>
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

				<svelte:boundary>
					{#if currentUser?.username}
						{#await getSavedPasswords()}
							<!-- Pending state handled by boundary -->
						{:then savedPasswords}
							<div class="flex gap-2">
								<Button onclick={handleView} variant="secondary" class="flex-1" disabled={viewing}>
									View Saved Passwords ({savedPasswords?.length || 0})
								</Button>
								<Button
									href="/apps/random-password-generator/passwords"
									variant="outline"
									size="icon"
									title="View all passwords"
								>
									<ExternalLink class="h-4 w-4" />
								</Button>
							</div>
						{:catch error}
							<Button variant="destructive" class="w-full" disabled>
								Error loading saved passwords
							</Button>
						{/await}

						<Button
							onclick={() => (viewing = false)}
							variant="secondary"
							class="w-full {!viewing ? 'hidden' : ''}"
							disabled={!viewing}
						>
							Hide Saved Passwords
						</Button>

						{#if viewing && savedPasswords}
							<div class="mt-4 space-y-2">
								<h3 class="text-lg font-semibold">Saved Passwords</h3>
								<ScrollArea class="h-[480px] w-full rounded-md border p-4">
									<div class="grid gap-4">
										{#each await getSavedPasswords() as savedPassword (savedPassword.id)}
											<PasswordDisplay password={savedPassword} />
										{:else}
											<p class="text-muted-foreground py-4 text-center">No saved passwords yet</p>
										{/each}
									</div>
								</ScrollArea>
							</div>
						{/if}
					{/if}

					{#snippet pending()}
						<div class="space-y-2">
							<Skeleton class="h-10 w-full rounded-md" />
							<Skeleton class="h-10 w-full rounded-md" />
						</div>
					{/snippet}
				</svelte:boundary>
			</div>
		</div>
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={randomPasswordGeneratorHowToUse.title}
	description={randomPasswordGeneratorHowToUse.description}
	tabs={randomPasswordGeneratorHowToUse.tabs}
	showFooterHelpText={randomPasswordGeneratorHowToUse.showFooterHelpText}
/>
