<script lang="ts">
	import { Input } from '@/ui/input';
	import { Star } from '@lucide/svelte';

	let { password } = $props();
</script>

<div
	class="flex items-center justify-between rounded-lg bg-gray-50 p-4 shadow-md transition-colors duration-200 hover:bg-gray-100"
>
	<div class="flex items-center space-x-2">
		<div class="flex-shrink-0">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-white shadow-lg"
			>
				<Star class="h-4 w-4" />
			</div>
		</div>

		<!-- Display the password -->

		<Input
			type="text"
			value={password.passwordHash}
			placeholder="Your password will appear here"
			readonly
			class="font-mono text-lg"
		/>
	</div>

	<!-- Display the creation date -->
	<div class="text-sm text-gray-500">
		{new Date(password.createdAt).toLocaleDateString()}
	</div>
</div>
