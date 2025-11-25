<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { updatePassword } from '$lib/remote';
	import { toast } from 'svelte-sonner';
	import {
		Shield,
		Lock,
		Eye,
		EyeOff,
		AlertCircle,
		KeyRound,
		Smartphone,
		ShieldCheck
	} from 'lucide-svelte';

	// Password visibility states
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Form values (for password strength indicator and validation)
	let currentPasswordValue = $state('');
	let newPasswordValue = $state('');
	let confirmPasswordValue = $state('');

	// Security settings state
	let twoFactorEnabled = $state(false);
	let loginAlerts = $state(true);

	// Password strength indicator
	let passwordStrength = $derived.by(() => {
		if (newPasswordValue.length === 0) return { strength: 0, label: '', color: '' };
		if (newPasswordValue.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' };

		let strength = 0;
		if (newPasswordValue.length >= 8) strength++;
		if (/[a-z]/.test(newPasswordValue) && /[A-Z]/.test(newPasswordValue)) strength++;
		if (/\d/.test(newPasswordValue)) strength++;
		if (/[^a-zA-Z0-9]/.test(newPasswordValue)) strength++;

		if (strength <= 2) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
		if (strength === 3) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
		return { strength: 4, label: 'Strong', color: 'bg-green-500' };
	});

	// Password match validation
	let passwordsMatch = $derived(newPasswordValue === confirmPasswordValue && newPasswordValue.length > 0);

	// Sync form values with local state for validation
	$effect(() => {
		updatePassword.fields.currentPassword.set(currentPasswordValue);
	});
	$effect(() => {
		updatePassword.fields.newPassword.set(newPasswordValue);
	});
	$effect(() => {
		updatePassword.fields.confirmPassword.set(confirmPasswordValue);
	});
</script>

<RouteHead
	title="Security Settings - Svelte Mini Apps"
	description="Manage your account security settings and password."
/>

<div class="space-y-8">
	<!-- Page Header -->
	<div>
		<h2 class="text-xl font-semibold tracking-tight">Security</h2>
		<p class="text-sm text-muted-foreground">Manage your password and security settings</p>
	</div>

	<!-- Change Password Card -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<div class="size-8 flex items-center justify-center rounded-lg bg-primary/10">
					<Lock class="size-4 text-primary" />
				</div>
				<div>
					<Card.Title>Change Password</Card.Title>
					<Card.Description>Update your password to keep your account secure</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<form
				{...updatePassword.enhance(async ({ form, submit }) => {
					const toastId = toast.loading('Updating password...');
					try {
						await submit();
						toast.success('Password updated successfully!', { id: toastId });
						form.reset();
						currentPasswordValue = '';
						newPasswordValue = '';
						confirmPasswordValue = '';
					} catch (error) {
						toast.error('Failed to update password', { id: toastId });
					}
				})}
				class="space-y-4"
			>
				<!-- Current Password -->
				<div class="space-y-2">
					<Label for="currentPassword">Current Password</Label>
					<div class="relative">
						<Input
							type={showCurrentPassword ? 'text' : 'password'}
							name="currentPassword"
							id="currentPassword"
							bind:value={currentPasswordValue}
							placeholder="Enter current password"
							required
							class="pr-10"
						/>
						<button
							type="button"
							onclick={() => (showCurrentPassword = !showCurrentPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{#if showCurrentPassword}
								<EyeOff class="size-4" />
							{:else}
								<Eye class="size-4" />
							{/if}
						</button>
					</div>
				</div>

				<!-- New Password -->
				<div class="space-y-2">
					<Label for="newPassword">New Password</Label>
					<div class="relative">
						<Input
							type={showNewPassword ? 'text' : 'password'}
							name="newPassword"
							id="newPassword"
							bind:value={newPasswordValue}
							placeholder="Enter new password"
							required
							class="pr-10"
						/>
						<button
							type="button"
							onclick={() => (showNewPassword = !showNewPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{#if showNewPassword}
								<EyeOff class="size-4" />
							{:else}
								<Eye class="size-4" />
							{/if}
						</button>
					</div>

					<!-- Password Strength Indicator -->
					{#if newPasswordValue.length > 0}
						<div class="space-y-1">
							<div class="flex gap-1">
								{#each Array(4) as _, i}
									<div
										class="h-1 flex-1 rounded-full transition-colors {i < passwordStrength.strength
											? passwordStrength.color
											: 'bg-muted'}"
									></div>
								{/each}
							</div>
							<p class="text-xs text-muted-foreground">
								Password strength: <span class="font-medium">{passwordStrength.label}</span>
							</p>
						</div>
					{/if}

					<p class="text-xs text-muted-foreground">Must be at least 8 characters long</p>
				</div>

				<!-- Confirm Password -->
				<div class="space-y-2">
					<Label for="confirmPassword">Confirm New Password</Label>
					<div class="relative">
						<Input
							type={showConfirmPassword ? 'text' : 'password'}
							name="confirmPassword"
							id="confirmPassword"
							bind:value={confirmPasswordValue}
							placeholder="Confirm new password"
							required
							class="pr-10"
						/>
						<button
							type="button"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{#if showConfirmPassword}
								<EyeOff class="size-4" />
							{:else}
								<Eye class="size-4" />
							{/if}
						</button>
					</div>

					{#if confirmPasswordValue.length > 0 && !passwordsMatch}
						<div class="flex items-center gap-1 text-xs text-destructive">
							<AlertCircle class="size-3" />
							<span>Passwords do not match</span>
						</div>
					{/if}
				</div>

				<Button
					type="submit"
					class="w-full"
					disabled={!currentPasswordValue ||
						!newPasswordValue ||
						!confirmPasswordValue ||
						!passwordsMatch ||
						!!updatePassword.pending}
				>
					{updatePassword.pending ? 'Updating...' : 'Update Password'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Additional Security Settings -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<div class="size-8 flex items-center justify-center rounded-lg bg-primary/10">
					<Shield class="size-4 text-primary" />
				</div>
				<div>
					<Card.Title>Security Options</Card.Title>
					<Card.Description>Additional security settings for your account</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex items-center gap-3">
					<Smartphone class="size-5 text-muted-foreground" />
					<div>
						<p class="font-medium">Two-Factor Authentication</p>
						<p class="text-sm text-muted-foreground">
							Add an extra layer of security (Coming Soon)
						</p>
					</div>
				</div>
				<Switch bind:checked={twoFactorEnabled} disabled />
			</div>

			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex items-center gap-3">
					<ShieldCheck class="size-5 text-muted-foreground" />
					<div>
						<p class="font-medium">Login Alerts</p>
						<p class="text-sm text-muted-foreground">Get notified of new logins (Coming Soon)</p>
					</div>
				</div>
				<Switch bind:checked={loginAlerts} disabled />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Security Tips -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-base">
				<KeyRound class="size-4" />
				Password Tips
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<ul class="space-y-2 text-sm text-muted-foreground">
				<li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
				<li>• Avoid using common words or personal information</li>
				<li>• Don't reuse passwords across multiple sites</li>
				<li>• Consider using a password manager for better security</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>
