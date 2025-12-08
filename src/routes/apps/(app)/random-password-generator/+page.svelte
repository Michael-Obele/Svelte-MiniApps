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
	import * as Dialog from '@/ui/dialog';
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
	let loadingPasswords = $state(false);
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

	// Create colored password display
	let coloredPassword = $derived.by(() => {
		if (!password) return [];
		return password.split('').map((char) => {
			let colorClass = '';
			if (/\d/.test(char)) {
				colorClass = 'text-orange-700 dark:text-orange-400'; // Numbers in orange (darker for light mode, lighter for dark mode)
			} else if (/[^A-Za-z0-9]/.test(char)) {
				colorClass = 'text-purple-700 dark:text-purple-400'; // Special characters in purple (darker for light mode, lighter for dark mode)
			} else {
				colorClass = 'text-foreground'; // Letters in default color
			}
			return { char, colorClass };
		});
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
		if (viewing) {
			viewing = false;
			return;
		}

		// If we don't have passwords loaded yet, load them
		if (!savedPasswords && !loadingPasswords) {
			await loadSavedPasswords();
		}

		viewing = true;
	}

	// Use effect to get current user asynchronously
	let currentUser = $state<User | null>(null);

	// Load current user on mount
	$effect(() => {
		getCurrentUser()
			.then((user) => {
				currentUser = user;
			})
			.catch((error) => {
				console.error('Error loading current user:', error);
			});
	});

	// Load saved passwords when user becomes available
	$effect(() => {
		if (currentUser && !savedPasswords && !loadingPasswords) {
			loadSavedPasswords();
		}
	});

	async function loadSavedPasswords() {
		if (loadingPasswords) return;

		try {
			loadingPasswords = true;
			savedPasswords = await getSavedPasswords();
		} catch (error) {
			console.error('Error loading saved passwords:', error);
			toast.error('Failed to load saved passwords');
		} finally {
			loadingPasswords = false;
		}
	}
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
				<div class="flex items-center gap-3">
					<Dialog.Root bind:open={showSavePopover}>
						{#if !saving}
							<Dialog.Trigger
								class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-12 items-center justify-center gap-2 rounded-md border text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
								disabled={!currentUser || !password}
							>
								<Star class="h-5 w-5 {isSaved ? 'fill-current' : ''}" />
							</Dialog.Trigger>
						{:else}
							<div class="flex size-12 items-center justify-center rounded-md border">
								<div
									class="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
								></div>
							</div>
						{/if}
						<Dialog.Content class="w-80">
							<Dialog.Header>
								<Dialog.Title>Save Password</Dialog.Title>
								<Dialog.Description>
									Add an optional description to help you remember what this password is for.
								</Dialog.Description>
							</Dialog.Header>
							<div class="grid gap-4 py-4">
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
							</div>
							<Dialog.Footer>
								<Button variant="outline" onclick={() => (showSavePopover = false)}>Cancel</Button>
								<Button onclick={handleSave} disabled={saving}>
									{#if saving}
										<div
											class="mr-2 size-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"
										></div>
									{/if}
									Save
								</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Root>

					<div
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[3rem] w-full items-center rounded-md border px-4 py-3 font-mono text-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xl"
					>
						{#if password}
							{#each coloredPassword as { char, colorClass }}
								<span class={colorClass}>{char}</span>
							{/each}
						{:else}
							<span class="text-muted-foreground text-lg md:text-xl"
								>Your password will appear here</span
							>
						{/if}
					</div>
					<Button
						variant="outline"
						size="lg"
						onclick={handleCopy}
						disabled={!password}
						class="size-12 shrink-0"
					>
						{#if copySuccess}
							<Check class="h-5 w-5" />
						{:else}
							<Copy class="h-5 w-5" />
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

			<div class="space-y-6">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<Label for="passwordLength" class="text-base font-medium">Password Length</Label>
						<span class="bg-muted rounded px-2 py-1 font-mono text-sm">{passwordLength}</span>
					</div>
					<Slider
						id="passwordLength"
						bind:value={passwordLength}
						min={8}
						max={32}
						step={1}
						type="single"
						class="my-3"
					/>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div
						class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
					>
						<Label class="cursor-pointer">Uppercase Letters</Label>
						<Switch bind:checked={includeUppercase} />
					</div>
					<div
						class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
					>
						<Label class="cursor-pointer">Lowercase Letters</Label>
						<Switch bind:checked={includeLowercase} />
					</div>
					<div
						class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
					>
						<Label class="cursor-pointer">Numbers</Label>
						<Switch bind:checked={includeNumbers} />
					</div>
					<div
						class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
					>
						<Label class="cursor-pointer">Special Characters</Label>
						<Switch bind:checked={includeSymbols} />
					</div>
				</div>

				<Button class="h-12 w-full text-base font-medium" onclick={generatePassword}>
					Generate Password
				</Button>

				{#if currentUser?.username}
					<div class="flex gap-3 pt-2">
						<Button onclick={handleView} variant="secondary" class="h-11 flex-1" disabled={viewing}>
							<span class="hidden sm:inline">View Saved Passwords</span>
							<span class="sm:hidden"
								>Saved ({loadingPasswords
									? '...'
									: savedPasswords
										? savedPasswords.length
										: '0'})</span
							>
						</Button>
						<Button
							href="/apps/random-password-generator/passwords"
							variant="outline"
							size="lg"
							title="View all passwords"
							class="size-11"
						>
							<ExternalLink class="h-5 w-5" />
						</Button>
					</div>

					<Button
						onclick={() => (viewing = false)}
						variant="secondary"
						class="w-full {!viewing ? 'hidden' : ''}"
						disabled={!viewing}
					>
						Hide Saved Passwords
					</Button>

					{#if viewing && savedPasswords}
						<div class="mt-6 space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-semibold">Saved Passwords</h3>
								<Button
									onclick={() => (viewing = false)}
									variant="ghost"
									size="sm"
									class="text-muted-foreground hover:text-foreground"
								>
									Hide
								</Button>
							</div>
							<ScrollArea class="bg-muted/20 h-[400px] w-full rounded-lg border p-4">
								<div class="space-y-3">
									{#each savedPasswords as savedPassword (savedPassword.id)}
										<PasswordDisplay password={savedPassword} />
									{:else}
										<div class="py-8 text-center">
											<p class="mb-2 text-muted-foreground">No saved passwords yet</p>
											<p class="text-sm text-muted-foreground">
												Generate and save your first password above
											</p>
										</div>
									{/each}
								</div>
							</ScrollArea>
						</div>
					{/if}
				{/if}
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
