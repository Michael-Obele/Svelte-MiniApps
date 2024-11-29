<script lang="ts">
	import type { PageData } from './$types';
	import type { ActionData } from './$types.js';

	let { data, form }: { data: PageData, form: ActionData } = $props();


	import UpcomingFeaturesList from './UpcomingFeaturesList.svelte';

	import FavoriteAppList from './FavoriteAppList.svelte';

	import LatestUpdatesList from './LatestUpdatesList.svelte';

	import AccountSettingsList from './AccountSettingsList.svelte';

	import MiniAppList from './MiniAppList.svelte';

	import UserProfileCard from './UserProfileCard.svelte';

	import PwdComponent from './PwdComponent.svelte';

</script>

<svelte:head>
	<title>Profile - Svelte Mini Apps</title>
	<meta
		name="description"
		content="Profile page for Svelte Mini Apps, a collection of small, focused web applications built with Svelte."
	/>
</svelte:head>

<section class="min-h-screen space-y-3 bg-gray-100 p-6 py-4 dark:bg-gray-900">
	<h1 class="text-lg font-semibold md:text-2xl lg:text-3xl">Profile Page</h1>
	<main class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- User Profile Card  -->
		<UserProfileCard />
		<!-- Mini App List  -->
		<!-- <MiniAppList /> -->
		<!-- Account Settings  -->
		<!-- <AccountSettingsList {form} /> -->
		<!-- Updates List  -->
		<!-- <LatestUpdatesList /> -->
		<!-- Favorite Apps  -->
		<!-- <FavoriteAppList /> -->
		<!-- Saved Passwords  -->
		<!-- <PwdComponent {form} /> -->
		<!-- Upcoming Features  -->
		<div class="col-span-1 grid gap-4 md:col-span-2 lg:col-span-3 lg:grid-cols-subgrid">
			<div class="col-start-1 lg:col-start-2">
				<UpcomingFeaturesList />
			</div>
		</div>
	</main>
</section>
