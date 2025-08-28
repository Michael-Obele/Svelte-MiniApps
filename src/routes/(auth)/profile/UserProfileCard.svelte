<script lang="ts">
	import { page } from '$app/state';
	import { Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription } from '@/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
	import { Badge } from '@/ui/badge';
	import { Button } from '@/ui/button';
	import { Separator } from '@/ui/separator';
	import { StarIcon, Edit2, Settings, LogOut, Github, Mail, Calendar } from '@lucide/svelte';

	// Get user data from page store
	let userData = page.data.user;

	// Format join date
	function formatJoinDate(dateString: string) {
		if (!dateString) return 'Unknown';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	console.log(userData);

	// Calculate user stats
	const userStats = $state({
		joinDate: formatJoinDate(userData?.createdAt || new Date().toISOString()),
		contributions: 127,
		followers: 48,
		following: 32
	});
</script>

<!--
@component
## Svelte Component: User Profile Card
This component displays a user's profile information, including their avatar, username, email, and admin status. It also provides a message about password recovery if the user does not have an associated email address.

## Key Features
- **User Information**: Displays the user's avatar, username, and email address.
- **Admin Status**: Shows a badge indicating whether the user has admin privileges.
- **Password Recovery Message**: Informs users without an associated email about the inability to recover their password.

## Data Source
Utilizes the `userData` object from the `page.data.user` store to populate the profile information.
-->

<Card class="h-full">
	<CardHeader class="pb-2 text-center">
		<div class="mx-auto mb-4">
			<Avatar class="h-24 w-24 border-4 border-primary/10">
				<AvatarImage src={userData?.image || ''} alt={userData?.username || 'User'} />
				<AvatarFallback class="text-2xl"
					>{userData?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback
				>
			</Avatar>
		</div>
		<CardTitle class="text-xl">{userData?.username || 'User'}</CardTitle>
		<CardDescription class="flex items-center justify-center gap-1">
			<Mail class="h-3 w-3" />
			<span>{userData?.email || 'No email provided'}</span>
		</CardDescription>

		<div class="mt-2 flex justify-center gap-2">
			{#if userData?.isAdmin}
				<Badge variant="default" class="bg-linear-to-r from-indigo-500 to-purple-500">Admin</Badge
				>
			{/if}
			<Badge variant="outline" class="gap-1">
				<Github class="h-3 w-3" />
				<span>Developer</span>
			</Badge>
		</div>
	</CardHeader>

	<CardContent>
		<div
			class="flex grid-cols-2 flex-col justify-center gap-4 py-2 text-center md:grid md:flex-row"
		>
			<div>
				<p class="text-sm text-muted-foreground">Contributions</p>
				<p class="text-xl font-bold">{userStats.contributions}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Joined</p>
				<p class="text-sm font-medium">{userStats.joinDate}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Followers</p>
				<p class="text-xl font-bold">{userStats.followers}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Following</p>
				<p class="text-xl font-bold">{userStats.following}</p>
			</div>
		</div>

		<Separator class="my-4" />

		{#if !userData?.email}
			<div class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
				<p class="text-sm text-yellow-800 dark:text-yellow-200">
					Without an email, you won't be able to recover your password if forgotten.
				</p>
			</div>
		{/if}
	</CardContent>

	<CardFooter class="flex justify-between gap-2">
		<Button variant="outline" size="sm" class="w-full gap-1">
			<Edit2 class="h-4 w-4" />
			<span>Edit Profile</span>
		</Button>
		<Button variant="ghost" size="icon" class="h-9 w-9">
			<Settings class="h-4 w-4" />
		</Button>
	</CardFooter>
</Card>
