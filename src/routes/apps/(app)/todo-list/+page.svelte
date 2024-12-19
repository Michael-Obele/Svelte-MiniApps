<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { sitename, siteurl, siteimage } from '$lib';
	import { page } from '$app/stores';
	import { X } from 'lucide-svelte';

	interface Todo {
		id: number;
		text: string;
		completed: boolean;
		[key: string]: any; // Allow for dynamic custom columns
	}

	let todos: Todo[] = $state([]);
	let newTodo = $state('');
	let customColumns = $state(['priority', 'dueDate']); // Define custom columns
	let newCustomColumn = $state('');
	let editingColumn: string = $state(''); // Track the column being edited
	let newColumnName = $state(''); // Store the new column name

	// Load todos from local storage on component mount
	if (typeof localStorage !== 'undefined') {
		const storedTodos = localStorage.getItem('todos');
		const storedColumns = localStorage.getItem('customColumns');
		if (storedTodos) {
			todos = JSON.parse(storedTodos);
		}
		if (storedColumns) {
			customColumns = JSON.parse(storedColumns);
		}
	}

	function addTodo() {
		if (newTodo.trim() === '') return;
		const newTodoObj: Todo = {
			id: Date.now(),
			text: newTodo,
			completed: false
		};
		// Initialize custom columns with empty values
		customColumns.forEach((column) => {
			newTodoObj[column] = '';
		});
		todos = [...todos, newTodoObj];
		newTodo = '';
		saveTodos();
	}

	function toggleTodo(id: number) {
		todos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
		saveTodos();
	}

	function deleteTodo(id: number) {
		todos = todos.filter((todo) => todo.id !== id);
		saveTodos();
	}

	function addCustomColumn() {
		if (newCustomColumn.trim() === '') return;
		customColumns = [...customColumns, newCustomColumn];
		// Initialize the new column for existing todos
		todos = todos.map((todo) => ({ ...todo, [newCustomColumn]: '' }));
		newCustomColumn = '';
		saveColumns();
		saveTodos();
	}

	function removeCustomColumn(column: string) {
		if (
			confirm(
				`Are you sure you want to remove the "${column}" column? This action cannot be undone.`
			)
		) {
			customColumns = customColumns.filter((col) => col !== column);
			// Remove the column data from all todos
			todos = todos.map((todo) => {
				const newTodo = { ...todo };
				delete newTodo[column];
				return newTodo;
			});
			saveColumns();
			saveTodos();
		}
	}

	function updateCustomValue(id: number, column: string, value: string) {
		todos = todos.map((todo) => (todo.id === id ? { ...todo, [column]: value } : todo));
		saveTodos();
	}

	function saveTodos() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('todos', JSON.stringify(todos));
		}
	}

	function saveColumns() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('customColumns', JSON.stringify(customColumns));
		}
	}

	// Function to start editing a column name
	function editColumnName(column: string) {
		editingColumn = column;
		newColumnName = column;
	}

	// Function to save the edited column name
	function saveColumnName() {
		if (newColumnName.trim() === '') return;
		customColumns = customColumns.map((column) =>
			column === editingColumn ? newColumnName : column
		);
		// Rename the column in all todos
		todos = todos.map((todo) => {
			const newTodo = { ...todo };
			newTodo[newColumnName] = newTodo[editingColumn];
			delete newTodo[editingColumn];
			return newTodo;
		});
		editingColumn = '';
		newColumnName = '';
		saveColumns();
		saveTodos();
	}
</script>

<svelte:head>
	<title>Todo List | {sitename}</title>
	<meta
		name="description"
		content="A persistent todo list application that helps you manage and track your tasks. Built with SvelteKit and TypeScript."
	/>

	<!-- SEO -->
	<meta name="robots" content="index, follow" />
	<meta
		name="keywords"
		content="todo list, task management, svelte, sveltekit, typescript, web application"
	/>
	<link rel="canonical" href={`${siteurl}${$page.url.pathname}`} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={sitename} />
	<meta property="og:title" content="Todo List" />
	<meta
		property="og:description"
		content="A persistent todo list application that helps you manage and track your tasks. Built with SvelteKit and TypeScript."
	/>
	<meta property="og:image" content={siteimage} />
	<meta property="og:url" content={`${siteurl}${$page.url.pathname}`} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Todo List" />
	<meta
		name="twitter:description"
		content="A persistent todo list application that helps you manage and track your tasks. Built with SvelteKit and TypeScript."
	/>
	<meta name="twitter:image" content={siteimage} />
</svelte:head>

<div class="mx-auto max-w-screen-xl px-4 py-8 dark:bg-gray-900">
	<h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">To-Do List with Persistence</h1>
	<div class="mb-4 flex">
		<input
			type="text"
			placeholder="Add a new todo"
			bind:value={newTodo}
			onkeydown={(e) => {
				if (e.key === 'Enter') addTodo();
			}}
			class="mr-2 flex-grow rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<button
			onclick={addTodo}
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">Add</button
		>
	</div>

	<!-- Custom Column Management -->
	<div class="mb-4 flex">
		<input
			type="text"
			placeholder="Add new column"
			bind:value={newCustomColumn}
			onkeydown={(e) => {
				if (e.key === 'Enter') addCustomColumn();
			}}
			class="mr-2 flex-grow rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<button
			onclick={addCustomColumn}
			class="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
			>Add Column</button
		>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="border-b dark:border-gray-700">
					<th class="p-2">Complete</th>
					<th class="p-2">Task</th>
					{#each customColumns as column}
						<th class="p-2">
							{#if editingColumn === column}
								<!-- Edit input field -->
								<input
									type="text"
									value={newColumnName}
									oninput={(e) => {
										const target = e.target as HTMLInputElement;
										newColumnName = target.value;
									}}
									onblur={saveColumnName}
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											saveColumnName();
										}
									}}
									class="w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							{:else}
								<!-- Display column name -->
								<button
									onclick={() => editColumnName(column)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											editColumnName(column);
										}
									}}
									class="cursor-pointer p-2 text-left"
								>
									{column}
								</button>
							{/if}
							<button
								onclick={() => removeCustomColumn(column)}
								class="ml-1 rounded bg-red-500 p-1 text-xs font-bold text-white hover:bg-red-700"
								><X size={10} /></button
							>
						</th>
					{/each}
					<th class="p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each todos as todo (todo.id)}
					<tr class="border-b dark:border-gray-700">
						<td class="p-2">
							<input
								type="checkbox"
								checked={todo.completed}
								onchange={() => toggleTodo(todo.id)}
							/>
						</td>
						<td class="p-2">
							<span class="text-gray-900 dark:text-white" class:line-through={todo.completed}>
								{todo.text}
							</span>
						</td>
						{#each customColumns as column}
							<td class="p-2">
								<input
									type="text"
									value={todo[column]}
									onchange={(e) => {
										const target = e.target as HTMLInputElement;
										updateCustomValue(todo.id, column, target.value);
									}}
									class="w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</td>
						{/each}
						<td class="p-2">
							<button
								onclick={() => deleteTodo(todo.id)}
								class="rounded bg-red-500 px-2 py-1 font-bold text-white hover:bg-red-700"
								>Delete</button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
