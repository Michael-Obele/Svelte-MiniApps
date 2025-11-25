<script lang="ts">
	import { getUserSessions, revokeSession, revokeAllOtherSessions } from '$lib/remote';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import {
		Monitor,
		Smartphone,
		Tablet,
		Globe,
		Clock,
		MapPin,
		Trash2,
		ShieldAlert,
		CheckCircle2
	} from 'lucide-svelte';

	// Get sessions query
	const sessionsQuery = getUserSessions();

	// Reactive derivations
	let sessions = $derived(sessionsQuery.current ?? []);
	let isLoading = $derived(!sessionsQuery.current);

	// State for dialogs
	let sessionToRevoke = $state<(typeof sessions)[number] | null>(null);
	let showRevokeAllDialog = $state(false);
	let isRevoking = $state(false);

	// Get device icon - simplified since userAgent is not available
	function getDeviceIcon() {
		return Monitor;
	}

	// Format relative time
	function formatRelativeTime(dateStr: string): string {
		const now = new Date();
		const date = new Date(dateStr);
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;

		return date.toLocaleDateString();
	}

	// Handle revoking a single session
	async function handleRevoke() {
		if (!sessionToRevoke) return;

		isRevoking = true;
		try {
			const formData = new FormData();
			formData.set('sessionId', sessionToRevoke.id);

			const response = await fetch(revokeSession.action, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('Session revoked successfully');
				await sessionsQuery.refresh();
			} else {
				const result = await response.json();
				toast.error(result.message || 'Failed to revoke session');
			}
		} catch (error) {
			toast.error('Failed to revoke session');
		} finally {
			isRevoking = false;
			sessionToRevoke = null;
		}
	}

	// Handle revoking all other sessions
	async function handleRevokeAll() {
		isRevoking = true;
		try {
			const formData = new FormData();
			formData.set('confirm', 'CONFIRM');

			const response = await fetch(revokeAllOtherSessions.action, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('All other sessions have been revoked');
				await sessionsQuery.refresh();
			} else {
				const result = await response.json();
				toast.error(result.message || 'Failed to revoke sessions');
			}
		} catch (error) {
			toast.error('Failed to revoke sessions');
		} finally {
			isRevoking = false;
			showRevokeAllDialog = false;
		}
	}

	// Count of other sessions (not current)
	let otherSessionsCount = $derived(sessions.filter((s) => !s.isCurrent).length);
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="flex items-center gap-2">
					<ShieldAlert class="size-5" />
					Active Sessions
				</Card.Title>
				<Card.Description>Manage your active sessions across devices</Card.Description>
			</div>

			{#if otherSessionsCount > 0}
				<Button variant="destructive" size="sm" onclick={() => (showRevokeAllDialog = true)}>
					Revoke All Others
				</Button>
			{/if}
		</div>
	</Card.Header>

	<Card.Content class="space-y-4">
		{#if isLoading}
			<!-- Loading state -->
			{#each [1, 2, 3] as i (i)}
				<div class="flex items-center gap-4 rounded-lg border p-4">
					<Skeleton class="size-10 rounded-lg" />
					<div class="flex-1 space-y-2">
						<Skeleton class="h-4 w-32" />
						<Skeleton class="h-3 w-48" />
					</div>
					<Skeleton class="h-8 w-20" />
				</div>
			{/each}
		{:else if sessions.length === 0}
			<div class="text-muted-foreground py-8 text-center">
				<Globe class="mx-auto mb-2 size-8 opacity-50" />
				<p>No active sessions found</p>
			</div>
		{:else}
			{#each sessions as session (session.id)}
				{@const DeviceIcon = getDeviceIcon()}
				<div
					class="hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4 transition-colors"
				>
					<!-- Device icon -->
					<div class="bg-muted flex size-10 items-center justify-center rounded-lg">
						<DeviceIcon class="text-foreground size-5" />
					</div>

					<!-- Session info -->
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<p class="font-medium">Session</p>
							{#if session.isCurrent}
								<Badge variant="default" class="gap-1">
									<CheckCircle2 class="size-3" />
									Current
								</Badge>
							{/if}
						</div>

						<div
							class="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
						>
							<span class="flex items-center gap-1">
								<Clock class="size-3" />
								Created {formatRelativeTime(session.createdAt)}
							</span>
						</div>
					</div>

					<!-- Actions -->
					{#if !session.isCurrent}
						<Button
							variant="ghost"
							size="sm"
							class="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onclick={() => (sessionToRevoke = session)}
						>
							<Trash2 class="size-4" />
							<span class="sr-only">Revoke session</span>
						</Button>
					{/if}
				</div>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>

<!-- Revoke single session dialog -->
<AlertDialog.Root
	open={sessionToRevoke !== null}
	onOpenChange={(open) => !open && (sessionToRevoke = null)}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Revoke Session</AlertDialog.Title>
			<AlertDialog.Description>
				This will log out the device and end its session. The user will need to log in again on that
				device.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isRevoking}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleRevoke}
				disabled={isRevoking}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
			>
				{#if isRevoking}
					Revoking...
				{:else}
					Revoke Session
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Revoke all sessions dialog -->
<AlertDialog.Root bind:open={showRevokeAllDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Revoke All Other Sessions</AlertDialog.Title>
			<AlertDialog.Description>
				This will log out all other devices ({otherSessionsCount} session{otherSessionsCount !== 1
					? 's'
					: ''}). Your current session will remain active.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isRevoking}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleRevokeAll}
				disabled={isRevoking}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
			>
				{#if isRevoking}
					Revoking...
				{:else}
					Revoke All
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
