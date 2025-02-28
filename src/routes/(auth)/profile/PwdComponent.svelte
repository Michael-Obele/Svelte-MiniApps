<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle } from '@/ui/card';
	import { page } from '$app/state';
	import { Separator } from '@/ui/separator';
	import type { ActionData } from './$types.js';
	import { buttonVariants } from '@/ui/button';

	import { ScrollArea } from '@/ui/scroll-area/index.js';

	import Button from '@/ui/button/button.svelte';
	import { enhance } from '$app/forms';
	import { formatDistance } from 'date-fns';


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
