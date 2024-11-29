<script>

	import Construction from "@/assets/Construction.svelte";

</script>

<section class="p-4 text-center">
	<h3 class="mb-4 text-2xl font-bold">Under Construction</h3>
	<p class="mb-4 text-lg">We're currently working on this App. Please check back later.</p>
	<div class="mx-auto h-[50vh] w-[50vw] items-center justify-center">
		<Construction />
	</div>
</section>






<!-- <script lang="ts">
    import InfoBtn from './info.svelte';
    import CreateBudget from './components/CreateBudget.svelte';
    import BudgetList from './components/BudgetList.svelte';
    import AddExpense from './components/AddExpense.svelte';
    import ExpenseList from './components/ExpenseList.svelte';
    import { budgets, budgetCurrency, type Budget, type Expense } from '$lib/utils';
    import { page } from '$app/stores';
    import { siteimage, siteurl } from '$lib';
    import { invalidateAll } from '$app/navigation';
    import { applyAction, deserialize } from '$app/forms';
    import type { ActionData } from './$types';

    // User Data
    const userData = $page.data.user?.userData;

    // State Management
    let syncing = false;
    let syncError: string | null = null;
    let syncSuccess: string | null = null;

    // Form handling
    let form: ActionData;

    async function handleSync(event: SubmitEvent) {
        const form = event.target as HTMLFormElement;
        syncing = true;
        syncError = null;
        syncSuccess = null;

        try {
            const formData = new FormData(form);
            formData.set('budgets', JSON.stringify($budgets));
            formData.set('userId', userData?.id || '');

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const result = deserialize(await response.text());
            console.log('result: ',result);

            if (result.type === 'success') {
                // Update the budgets store with the merged data from the server
                if (result.data?.data && Array.isArray(result.data.data)) {
                    budgets.set(result.data.data);
                } else {
                    budgets.set([]);
                }
                syncSuccess = 'Budgets synced successfully!';
                await invalidateAll();
            } else if (result.type === 'failure') {
                syncError = typeof result.data?.message === 'string' ? result.data.message : 'Failed to sync budgets';
            }

            applyAction(result);
        } catch (error) {
            console.error('Error syncing budgets:', error);
            syncError = error instanceof Error ? error.message : 'Failed to sync budgets';
        } finally {
            syncing = false;
        }
    }

    // Budget State
    let budgetName = '';
    let budgetAmount = '';
    let editingBudgetName: string | null = null;
    let editBudgetName = '';
    let editBudgetAmount = '';

    // Expense State
    let selectedBudgetName = '';
    let newExpenseName = '';
    let newExpenseAmount = '';
    let editingExpense: { budgetName: string; expenseIndex: number } | null = null;
    let editExpenseName = '';
    let editExpenseAmount = '';

    // Debug logging
    $: {
        console.log('Parent component state:', {
            selectedBudgetName,
            budgets: $budgets,
            currentBudget: $budgets.find(b => b.name === selectedBudgetName)
        });
    }

    // Utility Functions
    function formatNumberInput(e: Event): void {
        const target = e.target as HTMLInputElement;
        const value = target.value.replace(/[^\d]/g, '');
        const numberValue = Number(value);
        target.value = numberValue.toLocaleString();
    }

    const calculateRemainingBudget = (budget: Budget): string => {
        const budgetAmount = Number(budget.amount.replace(/,/g, ''));
        const totalExpenses = budget.expenses.reduce(
            (total, e) => total + Number(e.amount.replace(/,/g, '')),
            0
        );
        return (budgetAmount - totalExpenses).toLocaleString();
    };

    // Budget Management
</script>

<svelte:head>
    <title>Budget Tracker</title>
    <meta name="description" content="Track your budgets and expenses easily with this simple and intuitive budget tracker." />
    <meta property="og:title" content="Budget Tracker" />
    <meta property="og:description" content="Track your budgets and expenses easily with this simple and intuitive budget tracker." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={siteurl} />
    <meta property="og:image" content={siteimage} />
    <link rel="canonical" href={siteurl} />
</svelte:head>

<div class="container mx-auto p-4 text-white">
    <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-2xl font-bold">
            Budget Tracker
            <InfoBtn />
        </h2>
        {#if userData}
            <div class="flex items-center gap-4">
                <form 
                    action="?/syncBudgets" 
                    method="POST" 
                    on:submit|preventDefault={handleSync}
                >
                    <button
                        type="submit"
                        disabled={syncing}
                        class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {syncing ? 'Syncing...' : 'Sync'}
                    </button>
                </form>
                {#if syncError}
                    <span class="text-red-500">{syncError}</span>
                {:else if syncSuccess}
                    <span class="text-green-500">{syncSuccess}</span>
                {/if}
            </div>
        {/if}
    </div>

    <CreateBudget
        {budgetName}
        {budgetAmount}
        {formatNumberInput}
        on:createBudget={({ detail }) => {
            const { name, amount } = detail;
            const existingBudget = $budgets.find((b) => b.name.toLowerCase() === name.toLowerCase());
            if (existingBudget) {
                existingBudget.amount = amount;
                existingBudget.expenses = [];
            } else {
                $budgets.push({ name, amount, expenses: [] });
            }
            budgets.set($budgets);
            budgetName = '';
            budgetAmount = '';
        }}
    />

    {#if $budgets.length > 0}
        <BudgetList
            {editingBudgetName}
            {editBudgetName}
            {editBudgetAmount}
            {formatNumberInput}
            {calculateRemainingBudget}
            on:saveBudget={({ detail }) => {
                const { name, amount } = detail;
                if (editingBudgetName) {
                    const budget = $budgets.find((b) => b.name === editingBudgetName);
                    if (budget) {
                        budget.name = name;
                        budget.amount = amount;
                        budgets.set($budgets);
                    }
                    editingBudgetName = null;
                }
            }}
            on:editBudget={({ detail }) => {
                editingBudgetName = detail.name;
                editBudgetName = detail.name;
                editBudgetAmount = detail.amount;
            }}
            on:deleteBudget={({ detail }) => {
                budgets.set($budgets.filter((b) => b.name !== detail.name));
            }}
        />

        <AddExpense
            {selectedBudgetName}
            {newExpenseName}
            {newExpenseAmount}
            {formatNumberInput}
            on:selectBudget={({ detail }) => {
                selectedBudgetName = detail.budgetName;
                console.log('Budget selected:', detail.budgetName);
            }}
            on:addExpense={({ detail }) => {
                const { budgetName, name, amount } = detail;
                if (name && Number(amount) > 0 && budgetName) {
                    const updatedBudgets = $budgets.map(budget => {
                        if (budget.name === budgetName) {
                            return {
                                ...budget,
                                expenses: [...budget.expenses, { name, amount, done: false }]
                            };
                        }
                        return budget;
                    });
                    budgets.set(updatedBudgets);
                    newExpenseName = '';
                    newExpenseAmount = '';
                }
            }}
        />

        {#if selectedBudgetName}
            <ExpenseList
                {selectedBudgetName}
                {editingExpense}
                {editExpenseName}
                {editExpenseAmount}
                {formatNumberInput}
                on:saveExpense={({ detail }) => {
                    const { budgetName, expenseIndex, name, amount } = detail;
                    const updatedBudgets = $budgets.map(budget => {
                        if (budget.name === budgetName) {
                            const updatedExpenses = [...budget.expenses];
                            updatedExpenses[expenseIndex] = { 
                                ...updatedExpenses[expenseIndex],
                                name, 
                                amount 
                            };
                            return {
                                ...budget,
                                expenses: updatedExpenses
                            };
                        }
                        return budget;
                    });
                    budgets.set(updatedBudgets);
                    editingExpense = null;
                }}
                on:editExpense={({ detail }) => {
                    const { budgetName, expenseIndex, expense } = detail;
                    editingExpense = { budgetName, expenseIndex };
                    editExpenseName = expense.name;
                    editExpenseAmount = expense.amount;
                }}
                on:toggleExpenseDone={({ detail }) => {
                    const { budgetName, expenseIndex } = detail;
                    const updatedBudgets = $budgets.map(budget => {
                        if (budget.name === budgetName) {
                            const updatedExpenses = [...budget.expenses];
                            updatedExpenses[expenseIndex] = { 
                                ...updatedExpenses[expenseIndex],
                                done: !updatedExpenses[expenseIndex].done 
                            };
                            return {
                                ...budget,
                                expenses: updatedExpenses
                            };
                        }
                        return budget;
                    });
                    budgets.set(updatedBudgets);
                }}
                on:deleteExpense={({ detail }) => {
                    const { budgetName, expenseIndex } = detail;
                    const updatedBudgets = $budgets.map(budget => {
                        if (budget.name === budgetName) {
                            const updatedExpenses = [...budget.expenses];
                            updatedExpenses.splice(expenseIndex, 1);
                            return {
                                ...budget,
                                expenses: updatedExpenses
                            };
                        }
                        return budget;
                    });
                    budgets.set(updatedBudgets);
                    console.log('Expense deleted:', { budgetName, expenseIndex });
                }}
            />
        {/if}
    {/if}
</div> -->


