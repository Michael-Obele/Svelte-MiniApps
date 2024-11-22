<script lang="ts">
    import { budgets, budgetCurrency, type Budget } from '$lib/utils';
    import Button from '$lib/components/ui/button/button.svelte';
    import * as AlertDialog from '$lib/components/ui/alert-dialog';
    import { buttonVariants } from '$lib/components/ui/button/index.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        saveBudget: { name: string; amount: string };
        editBudget: Budget;
        deleteBudget: { name: string };
    }>();

    export let editingBudgetName: string | null;
    export let editBudgetName: string;
    export let editBudgetAmount: string;
    export let formatNumberInput: (e: Event) => void;
    export let calculateRemainingBudget: (budget: Budget) => string;

    function handleSaveBudget() {
        dispatch('saveBudget', { name: editBudgetName, amount: editBudgetAmount });
    }

    function handleEditBudget(budget: Budget) {
        dispatch('editBudget', budget);
    }

    function handleDeleteBudget(name: string) {
        dispatch('deleteBudget', { name });
    }
</script>

<div class="mb-4 rounded-md bg-green-500 p-4 shadow-md">
    <h3 class="mb-2 text-lg font-bold">Your Budgets</h3>
    {#each $budgets as budget}
        <div class="mb-4 border-t border-gray-600 pt-4">
            {#if editingBudgetName === budget.name}
                <form class="flex flex-col gap-2" on:submit|preventDefault={handleSaveBudget}>
                    <input
                        type="text"
                        bind:value={editBudgetName}
                        class="mb-2 w-full appearance-none rounded border border-gray-300 p-2"
                    />
                    <input
                        type="text"
                        bind:value={editBudgetAmount}
                        pattern="\d+(?:,\d+)*"
                        on:change={formatNumberInput}
                        class="mb-2 w-full appearance-none rounded border border-gray-300 p-2"
                    />
                    <div class="flex gap-2">
                        <button type="submit" class="rounded bg-blue-500 p-2 text-white hover:bg-blue-700">
                            Save
                        </button>
                        <button
                            type="button"
                            on:click={() => (editingBudgetName = null)}
                            class="rounded bg-gray-500 p-2 text-white hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            {:else}
                <h4 class="text-lg font-bold">{budget.name}</h4>
                <p>
                    Initial Amount: <span class="font-semibold">
                        {$budgetCurrency}{Number(budget.amount.replace(/,/g, '')).toLocaleString()}
                    </span>
                </p>
                <p>
                    Remaining: <span class="font-semibold">
                        {$budgetCurrency}{calculateRemainingBudget(budget)}
                    </span>
                </p>
                <div class="flex gap-2">
                    <Button
                        on:click={() => handleEditBudget(budget)}
                        class="bg-blue-500 text-white hover:bg-blue-700"
                    >
                        Edit
                    </Button>
                    <AlertDialog.Root>
                        <AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
                            Delete
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                            <AlertDialog.Header>
                                <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                                <AlertDialog.Description>
                                    This action cannot be undone. This will permanently delete your budget.
                                </AlertDialog.Description>
                            </AlertDialog.Header>
                            <AlertDialog.Footer>
                                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                <AlertDialog.Action
                                    class={buttonVariants({ variant: 'destructive' })}
                                    on:click={() => handleDeleteBudget(budget.name)}
                                >
                                    Continue
                                </AlertDialog.Action>
                            </AlertDialog.Footer>
                        </AlertDialog.Content>
                    </AlertDialog.Root>
                </div>
            {/if}
        </div>
    {/each}
</div>
