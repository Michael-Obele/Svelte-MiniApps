<script lang="ts">
	import { ScrollArea } from '@/ui/scroll-area/index.js';

	import { formatDistance } from 'date-fns';

	// Function to convert \n to <br>
	function convertNewlinesToBr(text: string) {
		return text.replace(/\n/g, '<br/>');
	}

	function truncateText(text: string, maxLength: number) {
		const originalText = text || '';
		if (originalText.length > maxLength) {
			return convertNewlinesToBr(originalText.slice(0, maxLength - 3)) + '...';
		}
		return convertNewlinesToBr(originalText);
	}
	import { page } from '$app/state';
	import { Card, CardHeader, CardContent, CardTitle } from '@/ui/card';

	import { Separator } from '@/ui/separator';
	import { Github } from '@lucide/svelte';
</script>

<!--
@component
## Svelte Component: Latest Updates List
This component fetches and displays a list of the latest updates (commits) from the Svelte Mini Apps repository on GitHub. It presents each update with its commit message, shortened SHA hash, and the time elapsed since the update. The component also provides a link to view the latest commit on GitHub.

## Key Features
- **Real-time Updates**: Fetches and displays the latest commit data from GitHub.
- **Concise Information**: Presents commit message, SHA hash, and time elapsed in an easy-to-read format.
- **GitHub Link**: Provides a direct link to the latest commit on GitHub for further details.
- **Loading State**: Displays a loading message while fetching commit data.
- **Error Handling**: Shows an error message if fetching commit data fails.

## Data Fetching
Utilizes `fetch` to retrieve commit data from the GitHub API and handles loading and error states gracefully.
-->
