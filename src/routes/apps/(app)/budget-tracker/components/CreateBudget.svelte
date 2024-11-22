<script lang="ts">
    import { budgets, budgetCurrency } from '$lib/utils';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher<{
        createBudget: { name: string; amount: string };
    }>();
    
    export let budgetName: string;
    export let budgetAmount: string;
    export let formatNumberInput: (e: Event) => void;

    function handleCreateBudget() {
        dispatch('createBudget', { name: budgetName, amount: budgetAmount });
    }
</script>

<div class="mb-4 rounded-md bg-green-500 p-4 shadow-md">
    <h3 class="mb-2 text-lg font-bold">Create Budget</h3>
    <div class="flex flex-col gap-4">
        <input
            type="text"
            bind:value={budgetName}
            placeholder="Name"
            class="mb-2 w-full appearance-none rounded border border-white bg-black p-2"
        />
        <input
            type="text"
            bind:value={budgetAmount}
            pattern="\d+(?:,\d+)*"
            on:change={formatNumberInput}
            placeholder="Initial Amount"
            class="mb-2 w-full appearance-none rounded border border-white bg-black p-2"
        />

        <select
            name="currency"
            id="currency"
            bind:value={$budgetCurrency}
            class="mb-2 w-full appearance-none rounded border border-white bg-black p-2 text-center"
        >
            <option value="$">USD: $</option>
            <option value="€">EUR: €</option>
            <option value="£">GBP: £</option>
            <option value="₦">NGN: ₦</option>
            <option value="¥">CNY: ¥</option>
        </select>

        <button
            on:click={handleCreateBudget}
            class="rounded bg-blue-500 p-2 text-white hover:bg-blue-700"
        >
            Create Budget
        </button>
    </div>
</div>
