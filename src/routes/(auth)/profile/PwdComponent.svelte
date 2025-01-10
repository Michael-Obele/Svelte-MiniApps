<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { page } from '$app/stores';
	import { Separator } from '$lib/components/ui/separator';
	import type { ActionData } from './$types.js';
	import { buttonVariants } from '$lib/components/ui/button';

	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	export let form: ActionData;

	import Button from '$lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';
	import { formatDistance } from 'date-fns';

	let userData = $page.data.user?.userData;
	const userId = $page.data.user.userData.id;
</script>

<!--
@component
## Svelte Component: Saved Passwords Display
This component allows users to view and manage their saved passwords. It provides options to hide or view saved passwords and displays each password along with its creation date, title, and details. The component utilizes form handling and conditional rendering to display relevant information and actions based on the user's saved passwords.

## Key Features
- **View Saved Passwords**: Users can see all their saved passwords, including title, details, and creation date.
- **Hide Option**: Offers a way to hide saved passwords for security reasons.

## Form Handling
Utilizes enhanced form handling to submit requests for viewing or hiding passwords securely.
-->
