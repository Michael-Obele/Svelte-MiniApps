<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Slider } from '@/ui/slider';
	import { Switch } from '@/ui/switch';
	import { Label } from '@/ui/label';
	import { Progress } from '@/ui/progress';
	import { toast } from 'svelte-sonner';
	import { Copy, Star, StarOff } from '@lucide/svelte';
	import { site } from '$lib';
	import { fade } from 'svelte/transition';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { copyToClipboard } from '$lib/utils';
	import type { PageProps } from './$types';
	import { Skeleton } from '@/ui/skeleton';
	import PasswordDisplay from './PasswordDisplay.svelte';
	import { getSavedPasswords, savePassword, deletePassword, getCurrentUser } from '$lib/remote';

	// Define User type inline to match what getCurrentUser returns
	type User = {
		id: string;
		username: string;
		role: string;
		createdAt: Date;
	};

	let { data }: PageProps = $props();

	let password = $state('');
	let passwordLength = $state(12);
	let includeUppercase = $state(true);
	let includeLowercase = $state(true);
	let includeNumbers = $state(true);
	let includeSymbols = $state(true);
	let passwordStrength = $state(0);
	let isSaved = $state(false);
	let viewing = $state(false);
	let saving = $state(false);
	let deletingId = $state<string | null>(null);
	let savedPasswords = $state<
		{ id: string; createdAt: Date; passwordHash: string; details: string | null }[] | null
	>(null);

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

		if (result) {
			isSaved = false;
		}
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

	const getStrengthColor = (strength: number): string => {
		if (strength <= 25) return 'bg-red-500';
		if (strength <= 50) return 'bg-orange-500';
		if (strength <= 75) return 'bg-yellow-500';
		return 'bg-green-500';
	};

	$effect(() => {
		if (password) calculateStrength();
	});

	async function handleSave() {
		if (saving || !currentUser || !password) return;

		try {
			saving = true;
			await savePassword({ password, details: null });
			isSaved = true;
			await getSavedPasswords().refresh();
			savedPasswords = await getSavedPasswords();
			toast.success('Password saved successfully!');
		} catch (error) {
			console.error('Error saving password:', error);
			toast.error('Failed to save password');
		} finally {
			saving = false;
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

	async function handleDelete(passwordId: string) {
		if (deletingId) return; // Prevent multiple simultaneous deletes

		try {
			deletingId = passwordId;
			await deletePassword(passwordId);
			toast.success('Password deleted successfully!');
			await getSavedPasswords().refresh();
			savedPasswords = await getSavedPasswords();
		} catch (error) {
			console.error('Error deleting password:', error);
			toast.error('Failed to delete password');
		} finally {
			deletingId = null;
		}
	}

	type PasswordRecord = {
		id: string;
		passwordHash: string;
		createdAt: string;
		details: null | string;
	};

	// Use effect to get current user asynchronously
	let currentUser = $state<User | null>(null);
	$effect(() => {
		getCurrentUser().then((user) => {
			currentUser = user;
		});
	});
</script>

<RouteHead
	title="{site.name} - Password Generator"
	description="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	keywords="password generator, secure passwords, random passwords, password security, svelte apps"
	route="/apps/password-generator"
	image={site.image}
/>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Password Generator</h1>
			<p class="text-muted-foreground">Generate secure, random passwords instantly</p>
		</div>

		<div class="bg-card space-y-4 rounded-lg border p-6">
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					{#if !saving}
						<Button
							onclick={handleSave}
							variant="outline"
							size="icon"
							disabled={!currentUser || !password}
						>
							<Star class="h-4 w-4 {isSaved ? 'fill-white' : ''}" />
						</Button>
					{:else}
						<div class="flex size-10 items-center justify-center rounded-md border">
							<div
								class="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
							></div>
						</div>
					{/if}
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
						onclick={() => copyToClipboard(password, 'Password copied to clipboard')}
						disabled={!password}
					>
						<Copy class="h-4 w-4" />
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
				<div class="space-y-2">
					<Label>Password Length: {passwordLength}</Label>
					<Slider bind:value={passwordLength} min={8} max={32} step={1} type="single" />
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
							<Button onclick={handleView} variant="secondary" class="w-full" disabled={viewing}>
								View Saved Passwords ({savedPasswords?.length || 0})
							</Button>
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
								{#each savedPasswords as savedPassword}
									<PasswordDisplay
										password={savedPassword}
										showDelete={true}
										onDelete={handleDelete}
										{deletingId}
									/>
								{/each}
								{#if savedPasswords.length === 0}
									<p class="text-muted-foreground py-4 text-center">No saved passwords yet</p>
								{/if}
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
