<script lang="ts">
    import { budgets, budgetCurrency, type Expense } from '$lib/utils';
    import Button from '$lib/components/ui/button/button.svelte';
    import * as AlertDialog from '$lib/components/ui/alert-dialog';
    import { buttonVariants } from '$lib/components/ui/button/index.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        saveExpense: { budgetName: string; expenseIndex: number; name: string; amount: string };
        editExpense: { budgetName: string; expenseIndex: number; expense: Expense };
        toggleExpenseDone: { budgetName: string; expenseIndex: number };
        deleteExpense: { budgetName: string; expenseIndex: number };
    }>();

    export let selectedBudgetName: string;
    export let editingExpense: { budgetName: string; expenseIndex: number } | null;
    export let editExpenseName: string;
    export let editExpenseAmount: string;
    export let formatNumberInput: (e: Event) => void;

    // Debug logging
    $: {
        console.log('ExpenseList component state:', {
            selectedBudgetName,
            budgets: $budgets,
            currentBudget: $budgets.find(b => b.name === selectedBudgetName),
            editingExpense
        });
    }

    function handleSaveExpense() {
        if (editingExpense) {
            dispatch('saveExpense', {
                budgetName: editingExpense.budgetName,
                expenseIndex: editingExpense.expenseIndex,
                name: editExpenseName,
                amount: editExpenseAmount
            });
        }
    }

    function handleEditExpense(budgetName: string, expenseIndex: number, expense: Expense) {
        dispatch('editExpense', { budgetName, expenseIndex, expense });
    }

    function handleToggleExpenseDone(budgetName: string, expenseIndex: number) {
        dispatch('toggleExpenseDone', { budgetName, expenseIndex });
    }

    function handleDeleteExpense(budgetName: string, expenseIndex: number) {
        dispatch('deleteExpense', { budgetName, expenseIndex });
    }
</script>

<div class="mt-4">
    <h4 class="text-lg font-bold">Expenses for {selectedBudgetName || 'No budget selected'}:</h4>
    {#if $budgets.length > 0 && selectedBudgetName}
        {@const budget = $budgets.find((b) => b.name === selectedBudgetName)}
        {#if budget}
            {#if budget.expenses?.length > 0}
                <ul class="mt-4 list-inside list-disc space-y-4">
                    {#each budget.expenses as expense, expenseIndex}
                        {#if editingExpense?.budgetName === selectedBudgetName && editingExpense?.expenseIndex === expenseIndex}
                            <form class="flex flex-col items-center gap-2" on:submit|preventDefault={handleSaveExpense}>
                                <input
                                    type="text"
                                    bind:value={editExpenseName}
                                    class="w-full appearance-none rounded border border-gray-300 p-2"
                                />
                                <input
                                    type="text"
                                    bind:value={editExpenseAmount}
                                    pattern="\d+(?:,\d+)*"
                                    on:change={formatNumberInput}
                                    class="w-full appearance-none rounded border border-gray-300 p-2"
                                />
                                <div class="flex gap-2">
                                    <Button type="submit" class="rounded bg-blue-500 text-white hover:bg-blue-700">
                                        Save
                                    </Button>
                                    <Button
                                        type="button"
                                        on:click={() => (editingExpense = null)}
                                        class="rounded bg-gray-500 text-white hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        {:else}
                            <li>
                                <span class={expense.done ? 'line-through opacity-50' : ''}>
                                    <span class="text-lg font-medium text-gray-900 dark:text-white">
                                        {expense.name}:
                                    </span>
                                    <span class="text-lg font-medium text-gray-700 dark:text-gray-200">
                                        {$budgetCurrency}{Number(expense.amount).toLocaleString()}
                                    </span>
                                </span>
                                <Button
                                    on:click={() => handleEditExpense(selectedBudgetName, expenseIndex, expense)}
                                    class="mx-3 bg-blue-500 p-1 px-4 text-white hover:bg-blue-700"
                                >
                                    Edit
                                </Button>
                                <Button
                                    on:click={() => handleToggleExpenseDone(selectedBudgetName, expenseIndex)}
                                    class="bg-green-500 p-1 px-4 text-white hover:bg-green-700"
                                >
                                    {expense.done ? 'Undo' : 'Done'}
                                </Button>
                                <AlertDialog.Root>
                                    <AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
                                        Delete
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Content>
                                        <AlertDialog.Header>
                                            <AlertDialog.Title>Delete Expense</AlertDialog.Title>
                                            <AlertDialog.Description>
                                                Are you sure you want to delete this expense? This action cannot be undone.
                                            </AlertDialog.Description>
                                        </AlertDialog.Header>
                                        <AlertDialog.Footer>
                                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                            <AlertDialog.Action
                                                class={buttonVariants({ variant: 'destructive' })}
                                                on:click={() => handleDeleteExpense(selectedBudgetName, expenseIndex)}
                                            >
                                                Delete
                                            </AlertDialog.Action>
                                        </AlertDialog.Footer>
                                    </AlertDialog.Content>
                                </AlertDialog.Root>
                            </li>
                            <hr class="border-gray-200 dark:border-gray-700" />
                        {/if}
                    {/each}
                </ul>
            {:else}
                <p>No expenses added yet for this budget.</p>
            {/if}
        {:else}
            <p>Selected budget not found.</p>
        {/if}
    {:else}
        <p>Please select a budget to view expenses.</p>
    {/if}
</div>
