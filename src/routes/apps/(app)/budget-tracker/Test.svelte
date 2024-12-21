<script lang="ts">
	interface Expense {
		name: string;
		amount: number;
	}

	let budgetName = $state('');
	let budgetAmount = $state(0);
	let expenseName = $state('');
	let expenseAmount = $state(0);

	function saveBudget() {
		const budget: { name: string; amount: number; expenses: Expense[] } = {
			name: budgetName,
			amount: parseFloat(budgetAmount.toString()),
			expenses: []
		};
		localStorage.setItem(budgetName.toString(), JSON.stringify(budget));
		budgetName = '';
		budgetAmount = 0;
	}

	function addExpense() {
		const budgetString = localStorage.getItem(budgetName);
		if (budgetString) {
			const budget: { name: string; amount: number; expenses: Expense[] } =
				JSON.parse(budgetString);
			budget.expenses.push({
				name: expenseName,
				amount: parseFloat(expenseAmount.toString())
			});
			localStorage.setItem(budgetName, JSON.stringify(budget));
			expenseName = '';
			expenseAmount = 0;
		} else {
			alert('Budget not found. Please save the budget first.');
		}
	}
</script>

<div>
	<h1>Create Budget</h1>
	<label for="budget-name">Budget Name:</label>
	<input type="text" id="budget-name" bind:value={budgetName} />

	<label for="budget-amount">Budget Amount:</label>
	<input type="number" id="budget-amount" bind:value={budgetAmount} />

	<button onclick={saveBudget}>Save Budget</button>

	<h2>Add Expense</h2>
	<label for="expense-name">Expense Name:</label>
	<input type="text" id="expense-name" bind:value={expenseName} />

	<label for="expense-amount">Expense Amount:</label>
	<input type="number" id="expense-amount" bind:value={expenseAmount} />

	<button onclick={addExpense}>Add Expense</button>

	<h2>Expenses</h2>
	<ul>
		{#if budgetName}
			{#each (() => {
				const budgetString = localStorage.getItem(budgetName);
				return budgetString ? JSON.parse(budgetString)?.expenses : [];
			})() as expense}
				<li>{expense.name}: {expense.amount}</li>
			{/each}
		{/if}
	</ul>

	{#if budgetName}
		<h3>
			Total Expenses: $
			{(() => {
				const budgetString = localStorage.getItem(budgetName);
				const budget = budgetString ? JSON.parse(budgetString) : null;
				return budget
					? budget.expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0)
					: 0;
			})()}
		</h3>
		<h3>
			Remaining Budget: $
			{(() => {
				const budgetString = localStorage.getItem(budgetName);
				const budget = budgetString ? JSON.parse(budgetString) : null;
				return budget
					? budget.amount -
							budget.expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0)
					: 0;
			})()}
		</h3>
	{/if}
</div>
