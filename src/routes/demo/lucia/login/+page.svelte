<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
		<h1 class="mb-6 text-center text-2xl font-bold text-gray-800">Login / Register</h1>

		<form method="post" action="?/login" use:enhance class="space-y-4">
			<div>
				<label for="username" class="mb-2 block text-sm font-medium text-gray-700">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					class="w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label for="password" class="mb-2 block text-sm font-medium text-gray-700">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					class="w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
				/>
			</div>

			<div class="flex justify-between">
				<button
					type="submit"
					class="rounded bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600"
					>Login</button
				>
				<button
					formaction="?/register"
					class="rounded bg-green-500 px-4 py-2 text-white transition duration-300 hover:bg-green-600"
					>Register</button
				>
			</div>
		</form>

		<p class="mt-4 text-center text-xs italic text-red-500">{form?.message ?? ''}</p>
	</div>
</div>
