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
	import { userContext } from '$lib/utils';
	import type { ActionData, PageData } from './$types';
	import { Skeleton } from '@/ui/skeleton';
	import PasswordDisplay from './PasswordDisplay.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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
	let isPasswordVisible = $state(false);

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

	$effect(() => {
		if (password) calculateStrength();
	});

	function handleSubmit() {
		saving = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isSaved = true;
			saving = false;
		};
	}

	function handleView() {
		viewing = true;
		// Add your form submission logic here
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			viewing = false;
		};
	}

	type PasswordRecord = {
		passwordHash: string;
		createdAt: string;
		details: null | string;
	};
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

		<div class="space-y-4 rounded-lg border bg-card p-6">
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<form action="?/save" use:enhance={handleSubmit} method="POST">
						<input type="hidden" name="id" value={$userContext?.id} />
						<input type="hidden" name="password" value={password} />
						{#if !saving}
							<Button
								type="submit"
								variant="outline"
								size="icon"
								disabled={!$userContext || !password}
							>
								<Star class="h-4 w-4 {isSaved ? 'fill-white' : ''}" />
							</Button>
						{:else}
							<Skeleton class="mx-auto h-5 w-[1.3rem] rounded-md text-center" />
						{/if}
					</form>
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
						<Progress value={passwordStrength} class="h-2" />
						<p class="mt-1 text-sm text-muted-foreground">
							Password Strength: {passwordStrength}%
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

				{#if $userContext?.username}
					<form action="?/view" use:enhance={handleView} method="POST">
						<input type="hidden" name="id" value={$userContext?.id} />
						<Button
							type="submit"
							variant="secondary"
							class="w-full"
							formaction={form?.displayPassword?.length === 0 ? undefined : '?/hide'}
						>
							{#if form?.displayPassword || isPasswordVisible}
								Hide Saved Password
							{:else if viewing}
								<Skeleton class="mx-auto h-5 w-[1.3rem] rounded-md text-center" />
							{:else}
								View Saved Password
							{/if}
						</Button>
					</form>
					{#each form?.displayPassword ?? [] as password}
						<PasswordDisplay {password} />
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
