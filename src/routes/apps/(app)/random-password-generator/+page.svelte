<script lang="ts">
	import PasswordManagerSection from './PasswordManagerSection.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { _generatePassword, _copyToClipboard } from './+page';
	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	import type { UserContext } from '$lib/types';
	import { afterUpdate, getContext } from 'svelte';
	import { enhance } from '$app/forms';

	import { showPassword, savePassword } from '$lib/utils';

	export let form: ActionData;

	const submitAction = () => {
		savePassword.set(true);
		showPassword.set(false);
	};

	const { userUsername } = getContext<UserContext>('userContext');

	let passwordOptions = {
		length: 12,
		lowercaseLetters: true,
		number: true,
		symbols: true,
		uppercaseLetters: true
	};

	let userData = $page.data.user?.userData;

	// Destructuring passwordOptions
	let { length, lowercaseLetters, number, symbols, uppercaseLetters } = passwordOptions;

	// Using destructured variables in the function call
	var password = _generatePassword(length, uppercaseLetters, lowercaseLetters, number, symbols);

	$: password = _generatePassword(length, uppercaseLetters, lowercaseLetters, number, symbols);

	// Reactive statement to ensure at least one option is always true
	let falseCount = 0;

	$: {
		falseCount = 0;
		falseCount += !lowercaseLetters ? 1 : 0;
		falseCount += !number ? 1 : 0;
		falseCount += !symbols ? 1 : 0;
		falseCount += !uppercaseLetters ? 1 : 0;
	}

	function generateNewPassword() {
		password = _generatePassword(length, uppercaseLetters, lowercaseLetters, number, symbols);

		savePassword.set(false);
		if (form) {
			form.saved = false;
		}
	}

	let savedPasswordArray: string[] = [];
	$: if (form?.saved) {
		savedPasswordArray.push(password);
	}
</script>

<svelte:head>
	<title>Svelte MiniApps - Password Generator</title>
	<meta
		name="description"
		content="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	/>
	<meta property="og:title" content="Svelte MiniApps - Password Generator" />
	<meta
		property="og:description"
		content="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	/>
	<meta property="og:url" content="https://svelte-apps.me/apps/password-generator" />
	<meta property="og:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Svelte MiniApps - Password Generator - Secure Your Accounts"
	/>
	<meta
		name="twitter:description"
		content="Generate strong, random passwords with ease using the Svelte MiniApps Random Password Generator."
	/>
	<meta name="twitter:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />

	<link rel="canonical" href="https://svelte-apps.me/apps/password-generator" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="UTF-8" />
	<meta name="robots" content="index, follow" />
	<script type="application/ld+json">
		{
			"@context": "http://schema.org",
			"@type": "WebApplication",
			"name": "Svelte MiniApps - Password Generator",
			"url": "https://svelte-apps.me/apps/password-generator",
			"description": "Generates random passwords with configurable length and complexity. Secure your accounts with ease."
		}
	</script>
</svelte:head>

<main class="container">
	<div class="container mt-10 flex flex-col items-center justify-center space-y-4">
		<h3 class="text-center text-4xl font-bold text-green-500">
			Welcome
			{userUsername || 'Guest'}!
		</h3>

		<h3 class="text-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
			Here's Your Secure Password
		</h3>
		<!-- Password View -->
		<div>
			<div class="flex flex-col align-middle shadow-sm xs:flex-row">
				<AlertDialog.Root>
					<AlertDialog.Trigger>
						<div
							class="pointer-events-none inline-block h-12 w-48 cursor-not-allowed overflow-hidden text-ellipsis whitespace-nowrap rounded-md border px-2 py-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 xs:rounded-r-none"
						>
							{password}
						</div>
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title class="text-center">Your Password</AlertDialog.Title>
							<AlertDialog.Description>
								<div
									class="max-w-lg break-words rounded-lg border border-blue-700 bg-blue-500 p-4 text-base text-white dark:border-blue-800 dark:bg-blue-900 dark:text-blue-100"
								>
									{password}
								</div>
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Close</AlertDialog.Cancel>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
				<div class="flex h-12">
					<button
						type="button"
						on:click={generateNewPassword}
						class="inline-flex items-center justify-center rounded-l-md border bg-white px-4 py-3 align-middle text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white xs:rounded-l-none"
					>
						Generate
					</button>
					{#if userUsername}
						{@const saved = form?.saved || savedPasswordArray.includes(password)}
						<form action="?/save" use:enhance method="POST">
							<input type="hidden" name="password" bind:value={password} />
							<input type="hidden" name="id" value={userData?.id} />
							<button
								type="submit"
								on:click={() => submitAction()}
								class="inline-flex h-12 items-center justify-center border border-b border-t px-4 py-3 text-sm font-semibold text-black dark:text-white {saved
									? 'bg-green-500 dark:bg-green-500'
									: 'hover:bg-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
							>
								{#if saved}
									Saved
								{:else if $savePassword}
									Saving
								{:else}
									Save
								{/if}
							</button>
						</form>
					{/if}
					<button
						type="button"
						on:click={() => _copyToClipboard(password)}
						class="inline-flex items-center justify-center rounded-e-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
					>
						Copy
					</button>
				</div>
			</div>
		</div>
		<!-- End of Password View -->
	</div>
</main>

<section class="mx-auto flex w-full flex-col justify-center md:flex-row">
	<!-- Check boxes for password format -->
	<div class="mx-auto w-1/2">
		<h4 class="m-6 mt-12 text-center text-2xl">Choose another Password</h4>
		<div class="mx-auto flex max-w-[80vw] flex-col items-center justify-center md:mx-0">
			<div class="mx-3 flex w-fit flex-col items-center space-x-5 md:flex-row">
				<label class="text-lg font-bold" for="length">Edit length:</label>
				<input
					type="number"
					name="length"
					id="length"
					disabled
					bind:value={length}
					min="10"
					max="50"
					required
					class="my-4 w-20 rounded-lg border-2 border-gray-300 px-4 py-2 text-center md:my-0"
					placeholder=""
				/>
				<input
					type="range"
					bind:value={length}
					min="10"
					max="50"
					id="length"
					name="length"
					list="markers"
					class="my-4 w-full md:my-0"
				/>

				<ul
					class="m-4 w-48 rounded-lg border border-gray-200 bg-white px-1 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:m-0"
				>
					<li class="w-full rounded-t-lg border-b border-gray-200 dark:border-gray-600">
						<div class="flex items-center ps-3">
							<input
								id="uppercase"
								type="checkbox"
								disabled={falseCount >= 3 && uppercaseLetters == true}
								bind:checked={uppercaseLetters}
								class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
							/>
							<label
								for="uppercase"
								class="ms-2 w-full py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
								>uppercase</label
							>
						</div>
					</li>
					<li class="w-full rounded-t-lg border-b border-gray-200 dark:border-gray-600">
						<div class="flex items-center ps-3">
							<input
								id="lowercase"
								type="checkbox"
								disabled={falseCount >= 3 && lowercaseLetters == true}
								bind:checked={lowercaseLetters}
								class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
							/>
							<label
								for="lowercase"
								class="ms-2 w-full py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
								>lowercase</label
							>
						</div>
					</li>
					<li class="w-full rounded-t-lg border-b border-gray-200 dark:border-gray-600">
						<div class="flex items-center ps-3">
							<input
								id="numbers"
								type="checkbox"
								disabled={falseCount >= 3 && number == true}
								bind:checked={number}
								class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
							/>
							<label
								for="numbers"
								class="ms-2 w-full py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
								>numbers</label
							>
						</div>
					</li>
					<li class="w-full rounded-t-lg border-gray-200 dark:border-gray-600">
						<div class="flex items-center ps-3">
							<input
								id="symbols"
								type="checkbox"
								disabled={falseCount >= 3 && symbols == true}
								bind:checked={symbols}
								class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
							/>
							<label
								for="symbols"
								class="ms-2 w-full py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
								>symbols</label
							>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<!--  -->
	{#if userData?.SavePassword}
		<PasswordManagerSection {form} />
	{/if}
</section>
