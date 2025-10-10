<script lang="ts">
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import * as Card from '@/ui/card';
	import { Eye, EyeOff, Lock, AlertCircle } from '@lucide/svelte';
	import { updatePassword } from '$lib/remote';
	import { toast } from 'svelte-sonner';

	// Password visibility states
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Form values
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// Password strength indicator
	let passwordStrength = $derived.by(() => {
		if (newPassword.length === 0) return { strength: 0, label: '', color: '' };
		if (newPassword.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
		
		let strength = 0;
		if (newPassword.length >= 8) strength++;
		if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;
		if (/\d/.test(newPassword)) strength++;
		if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;

		if (strength <= 2) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
		if (strength === 3) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
		return { strength: 4, label: 'Strong', color: 'bg-green-500' };
	});

	// Password match validation
	let passwordsMatch = $derived(newPassword === confirmPassword && newPassword.length > 0);

	// Submitting state
	let isSubmitting = $state(false);

	// Handle form submission with toast notifications
	async function handlePasswordUpdate(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		const toastId = toast.loading('Updating password...');

		try {
			const formData = new FormData(event.target as HTMLFormElement);
			const response = await fetch(updatePassword.action, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success('Password updated successfully!', { id: toastId });
				// Reset form
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				toast.error(result.message || 'Failed to update password', { id: toastId });
			}
		} catch (error) {
			toast.error('An error occurred while updating password', { id: toastId });
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle class="flex items-center gap-2">
			<Lock class="h-5 w-5" />
			Change Password
		</Card.CardTitle>
		<Card.CardDescription>
			Update your password to keep your account secure
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handlePasswordUpdate} class="space-y-4">
			<!-- Current Password -->
			<div class="space-y-2">
				<Label for="currentPassword">Current Password</Label>
				<div class="relative">
					<Input
						type={showCurrentPassword ? 'text' : 'password'}
						name="currentPassword"
						id="currentPassword"
						bind:value={currentPassword}
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
							<EyeOff class="h-4 w-4" />
						{:else}
							<Eye class="h-4 w-4" />
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
						bind:value={newPassword}
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
							<EyeOff class="h-4 w-4" />
						{:else}
							<Eye class="h-4 w-4" />
						{/if}
					</button>
				</div>

				<!-- Password Strength Indicator -->
				{#if newPassword.length > 0}
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

				<p class="text-xs text-muted-foreground">
					Must be at least 8 characters long
				</p>
			</div>

			<!-- Confirm Password -->
			<div class="space-y-2">
				<Label for="confirmPassword">Confirm New Password</Label>
				<div class="relative">
					<Input
						type={showConfirmPassword ? 'text' : 'password'}
						name="confirmPassword"
						id="confirmPassword"
						bind:value={confirmPassword}
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
							<EyeOff class="h-4 w-4" />
						{:else}
							<Eye class="h-4 w-4" />
						{/if}
					</button>
				</div>

				{#if confirmPassword.length > 0 && !passwordsMatch}
					<div class="flex items-center gap-1 text-xs text-destructive">
						<AlertCircle class="h-3 w-3" />
						<span>Passwords do not match</span>
					</div>
				{/if}
			</div>

			<Button
				type="submit"
				class="w-full"
				disabled={!currentPassword || !newPassword || !confirmPassword || !passwordsMatch || isSubmitting}
			>
				{isSubmitting ? 'Updating...' : 'Update Password'}
			</Button>
		</form>
	</Card.CardContent>
</Card.Card>
