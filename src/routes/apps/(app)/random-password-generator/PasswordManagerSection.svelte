<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	import { Pencil, Trash2 } from 'lucide-svelte';

	import { showPassword } from '$lib/utils';

	export let form;

	let userData = $page.data.user?.userData;

	let readOnlyStates: boolean[] = []; // Track the readonly state of each input

	// Reactive statement to initialize readOnlyStates based on form.displayPassword
	$: if (form?.displayPassword) {
		form.displayPassword.forEach((_: string, i: number) => {
			readOnlyStates[i] = true; // Initialize all inputs as readonly
		});
	}

	function toggleReadOnly(i: number) {
		readOnlyStates[i] = !readOnlyStates[i];
	}
</script>

<section
	class="mx-auto my-12 w-3/4 max-w-md rounded-lg border bg-white p-4 shadow-md dark:bg-gray-800"
>
	<p class="mb-2 text-center text-green-500 dark:text-green-400">You can save passwords.</p>
	<form use:enhance action="?/viewPasswords" method="POST" class="space-y-4">
		<input type="hidden" name="id" value={userData?.id} />
		{#if form?.displayPassword?.length > 0}
			<p class="text-center text-gray-700 dark:text-gray-300">
				You have {form?.displayPassword.length} saved passwords.
			</p>
			<button
				formaction="?/hidePasswords"
				on:click={() => showPassword.set(false)}
				class="inline-block w-full rounded bg-green-500 px-4 py-2 font-semibold text-white transition duration-150 ease-in-out hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500"
			>
				Hide Saved Passwords
			</button>
		{:else}
			<button
				type="submit"
				on:click={() => showPassword.set(true)}
				class="inline-block w-full rounded bg-green-500 px-4 py-2 font-semibold text-white transition duration-150 ease-in-out hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500"
			>
				{#if $showPassword && form?.displayPassword?.length == 0}
					Loading Passwords
				{:else}
					View Saved Passwords
				{/if}
			</button>
		{/if}

		<ScrollArea class="h-96 w-fit rounded-md border">
			{#if form?.displayPassword}
				{#each form?.displayPassword as item, i}
					<div class="mb-4 rounded-lg bg-white p-4 dark:bg-gray-800">
						<form
							action="?/update"
							class:hidden={readOnlyStates[i]}
							use:enhance
							method="POST"
							class="flex-col space-y-2"
						>
							<input type="hidden" name="id" value={item.id} />
							<input
								type="text"
								value={item.title}
								placeholder="Title"
								name="title"
								readonly={readOnlyStates[i]}
								required={readOnlyStates[i]}
								class="rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
							/>
							<input
								type="text"
								value={item.details}
								placeholder="Description"
								name="details"
								readonly={readOnlyStates[i]}
								required={readOnlyStates[i]}
								class="rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
							/>
							<button
								type="submit"
								class="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
							>
								submit
							</button>
						</form>

						<Button
							onclick={() => toggleReadOnly(i)}
							variant="outline"
							class="mt-1 {!readOnlyStates[i]
								? 'bg-blue-500 text-black hover:bg-blue-500 hover:text-white dark:text-white'
								: 'text-black  hover:bg-blue-500 dark:text-white'}"
							aria-label="toggle edit"
						>
							<Pencil class="h-4 w-4" />
						</Button>

						<AlertDialog.Root>
							<AlertDialog.Trigger>
								<Button
									variant="outline"
									class="mt-1 bg-red-300 text-black hover:bg-red-700 hover:text-white dark:bg-red-700 dark:text-white hover:dark:bg-red-500"
									aria-label="toggle edit"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title class="text-center">Delete Your Password!?</AlertDialog.Title>
									<AlertDialog.Description>
										<h3 class="text-center text-lg font-semibold text-red-600">
											Delete the password <span class="rounded-sm bg-white p-1 font-bold"
												>{item.password}</span
											> <br /> This process can't be undone!
										</h3>
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Action class="bg-red-600 hover:bg-red-500">
										<form action="?/delete" use:enhance method="POST">
											<input type="hidden" name="id" value={item.id} />
											<button on:click={() => showPassword.set(false)} type="submit">
												Continue
											</button>
										</form>
									</AlertDialog.Action>
									<AlertDialog.Cancel>Close</AlertDialog.Cancel>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>

						<h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">{item.title ?? ''}</h3>

						<h3 class="text-lg text-gray-600 dark:text-gray-300">{item.details ?? ''}</h3>

						<p class="mt-2 text-gray-700 dark:text-gray-300">
							<span
								class="block rounded bg-white p-2 text-red-500 dark:bg-gray-800 dark:text-red-400"
							>
								{item.password}
							</span>
							was created on {item.createdAt}.
						</p>
						<hr class="my-4 border-t-2 border-green-500 dark:border-green-400" />
					</div>
				{/each}
			{/if}
		</ScrollArea>
	</form>
</section>
