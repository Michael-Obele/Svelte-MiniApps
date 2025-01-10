<script lang="ts">
	import { page } from '$app/state';
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { StarIcon } from 'lucide-svelte';
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
