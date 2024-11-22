<script lang="ts">
    import { budgets } from '$lib/utils';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        addExpense: { budgetName: string; name: string; amount: string };
        selectBudget: { budgetName: string };
    }>();

    export let selectedBudgetName: string;
    export let newExpenseName: string;
    export let newExpenseAmount: string;
    export let formatNumberInput: (e: Event) => void;

    // Debug logging
    $: {
        console.log('AddExpense component state:', {
            selectedBudgetName,
            budgets: $budgets,
            newExpenseName,
            newExpenseAmount
        });
    }

    function handleAddExpense() {
        dispatch('addExpense', {
            budgetName: selectedBudgetName,
            name: newExpenseName,
            amount: newExpenseAmount
        });
    }

    function handleBudgetSelect(e: Event) {
        const select = e.target as HTMLSelectElement;
        const budgetName = select.value;
        selectedBudgetName = budgetName;
        dispatch('selectBudget', { budgetName });
    }
</script>

<div class="mb-4 rounded-md bg-green-500 p-4 shadow-md">
    <h3 class="mb-2 text-lg font-bold">Add Expense</h3>
    <div class="mb-4">
        <label for="budget-select" class="mb-2 block font-bold text-gray-700">Select Budget:</label>
        <select
            id="budget-select"
            value={selectedBudgetName}
            on:change={handleBudgetSelect}
            placeholder="Select a budget"
            class="mb-2 w-full appearance-none rounded border border-white bg-black p-2"
        >
            <option value="" disabled>Select a budget</option>
            {#each $budgets as budget}
                <option value={budget.name}>{budget.name}</option>
            {/each}
        </select>
    </div>

    {#if selectedBudgetName}
        <div class="my-2 flex flex-row items-center space-x-2">
            <input
                type="text"
                bind:value={newExpenseName}
                placeholder="Expense name"
                class="w-full appearance-none rounded border border-white bg-black p-2"
            />
            <input
                type="text"
                bind:value={newExpenseAmount}
                pattern="\d+(?:,\d+)*"
                on:change={formatNumberInput}
                placeholder="Amount"
                class="w-24 appearance-none rounded border border-white bg-black p-2"
            />
            <button
                on:click={handleAddExpense}
                class="text-nowrap rounded bg-blue-500 p-2 text-white hover:bg-blue-700"
            >
                Add Expense
            </button>
        </div>
    {/if}
</div>
