<script lang="ts">
	import { getUserSessions, revokeSession, revokeAllOtherSessions } from '$lib/remote';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import {
		Monitor,
		Globe,
		Clock,
		Trash2,
		ShieldAlert,
		CheckCircle2,
		RefreshCw
	} from 'lucide-svelte';

	// Get sessions query
	const sessionsQuery = getUserSessions();

	// Reactive derivations
	let sessions = $derived(sessionsQuery.current ?? []);
	let isLoading = $derived(!sessionsQuery.current);

	// State for dialogs
	let sessionToRevoke = $state<(typeof sessions)[number] | null>(null);
	let showRevokeAllDialog = $state(false);
	let isRefreshing = $state(false);

	// Get form instance for the session to revoke
	let revokeForm = $derived(sessionToRevoke ? revokeSession.for(sessionToRevoke.id) : null);

	// Set the sessionId field when the form is ready
	$effect(() => {
		if (revokeForm && sessionToRevoke) {
			revokeForm.fields.sessionId.set(sessionToRevoke.id);
		}
	});

	// Set the confirm field for revoke all form
	$effect(() => {
		if (showRevokeAllDialog) {
			revokeAllOtherSessions.fields.confirm.set('CONFIRM');
		}
	});

	// Refresh sessions
	async function refreshSessions() {
		isRefreshing = true;
		try {
			await sessionsQuery.refresh();
		} finally {
			setTimeout(() => {
				isRefreshing = false;
			}, 500);
		}
	}

	// Get device icon based on session (simplified since we don't have userAgent)
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

	// Format expiry date
	function formatExpiryDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	// Count of other sessions (not current)
	let otherSessionsCount = $derived(sessions.filter((s) => !s.isCurrent).length);
</script>

<RouteHead
	title="Active Sessions - Svelte Mini Apps"
	description="Manage your active sessions across devices."
/>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-semibold tracking-tight">Active Sessions</h2>
			<p class="text-muted-foreground text-sm">
				Manage your active sessions across different devices
			</p>
		</div>
		<Button
			variant="outline"
			size="sm"
			class="gap-2"
			onclick={refreshSessions}
			disabled={isRefreshing}
		>
			<RefreshCw class="size-4 {isRefreshing ? 'animate-spin' : ''}" />
			<span class="hidden sm:inline">Refresh</span>
		</Button>
	</div>

	<!-- Sessions Card -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
						<ShieldAlert class="text-primary size-4" />
					</div>
					<div>
						<Card.Title>Your Sessions</Card.Title>
						<Card.Description>
							{#if isLoading}
								Loading sessions...
							{:else}
								{sessions.length} active session{sessions.length !== 1 ? 's' : ''}
							{/if}
						</Card.Description>
					</div>
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
								<span class="text-xs">Expires {formatExpiryDate(session.expiresAt)}</span>
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

	<!-- Security Tips -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Security Tips</Card.Title>
		</Card.Header>
		<Card.Content>
			<ul class="text-muted-foreground space-y-2 text-sm">
				<li>• Revoke sessions from devices you no longer use or don't recognize</li>
				<li>• Your current session will remain active when revoking other sessions</li>
				<li>• Consider changing your password if you notice suspicious activity</li>
				<li>• Sessions automatically expire after 30 days of inactivity</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>

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
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			{#if revokeForm}
				<form
					{...revokeForm.enhance(async ({ form, submit }) => {
						try {
							await submit();
							form.reset();
							toast.success('Session revoked successfully');
							sessionToRevoke = null;
						} catch (error) {
							toast.error('Failed to revoke session');
						}
					})}
				>
					<input type="hidden" name="sessionId" value={sessionToRevoke?.id ?? ''} />
					<Button type="submit" variant="destructive" disabled={!!revokeForm.pending}>
						{#if revokeForm.pending}
							Revoking...
						{:else}
							Revoke Session
						{/if}
					</Button>
				</form>
			{/if}
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
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				{...revokeAllOtherSessions.enhance(async ({ form, submit }) => {
					try {
						await submit();
						form.reset();
						toast.success('All other sessions have been revoked');
						showRevokeAllDialog = false;
					} catch (error) {
						toast.error('Failed to revoke sessions');
					}
				})}
			>
				<input type="hidden" name="confirm" value="CONFIRM" />
				<Button type="submit" variant="destructive" disabled={!!revokeAllOtherSessions.pending}>
					{#if revokeAllOtherSessions.pending}
						Revoking...
					{:else}
						Revoke All
					{/if}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
