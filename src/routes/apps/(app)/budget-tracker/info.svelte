<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Info } from 'lucide-svelte';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder>
		<Button builders={[builder]} class="p-1" variant="ghost">
			<Info class="size-6" />
		</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>About Budget Tracker</AlertDialog.Title>
			<AlertDialog.Description>
				Budget Tracker helps you manage your finances by tracking expenses and monitoring your
				budgets. Create budgets, log your spending, and see how much you have remaining at a glance.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Understood</AlertDialog.Cancel>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
