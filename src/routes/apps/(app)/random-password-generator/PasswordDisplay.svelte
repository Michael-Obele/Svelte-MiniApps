<script lang="ts">
	import { Input } from '@/ui/input';
	import { Button } from '@/ui/button';
	import { Eye, EyeOff, Copy, Trash2, Check } from '@lucide/svelte';
	import { copyToClipboard } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let {
		password,
		showDelete = false,
		onDelete,
		deletingId
	}: {
		password: {
			id: string;
			passwordHash: string;
			createdAt: Date | string;
			details: string | null;
		};
		showDelete?: boolean;
		onDelete?: (id: string) => void;
		deletingId?: string | null;
	} = $props();

	let showPassword = $state(false);
	let copySuccess = $state(false);

	async function copyPassword() {
		await copyToClipboard(
			password.passwordHash,
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
</script>

<div
	class="bg-card hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
>
	<div class="flex-1 space-y-2">
		<div class="flex items-center gap-2">
			<Input
				type={showPassword ? 'text' : 'password'}
				value={password.passwordHash}
				readonly
				class="h-auto border-none bg-transparent p-0 font-mono text-sm focus-visible:ring-0"
			/>
			<Button
				onclick={() => (showPassword = !showPassword)}
				variant="ghost"
				size="sm"
				class="h-8 w-8 p-0"
			>
				{#if showPassword}
					<EyeOff class="h-4 w-4" />
				{:else}
					<Eye class="h-4 w-4" />
				{/if}
			</Button>
			<Button
				onclick={copyPassword}
				variant="ghost"
				size="sm"
				class="h-8 w-8 p-0 {copySuccess ? 'text-green-600' : ''}"
			>
				{#if copySuccess}
					<Check class="h-4 w-4" />
				{:else}
					<Copy class="h-4 w-4" />
				{/if}
			</Button>
			{#if showDelete && onDelete}
				<Button
					onclick={() => onDelete(password.id)}
					variant="ghost"
					size="sm"
					class="text-destructive hover:text-destructive h-8 w-8 p-0"
					disabled={deletingId === password.id}
				>
					{#if deletingId === password.id}
						<div
							class="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
						></div>
					{:else}
						<Trash2 class="h-4 w-4" />
					{/if}
				</Button>
			{/if}
		</div>
		<p class="text-muted-foreground text-xs">
			Saved on {new Date(password.createdAt).toLocaleDateString()} at {new Date(
				password.createdAt
			).toLocaleTimeString()}
		</p>
	</div>
</div>
