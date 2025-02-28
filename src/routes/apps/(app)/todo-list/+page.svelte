<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { site } from '$lib';
	import { page } from '$app/state';
	import { X } from 'lucide-svelte';
	import { Button } from '@/ui/button';
	import Input from '@/ui/input/input.svelte';
	import { Checkbox } from '@/ui/checkbox';

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
	<title>Todo List | {site.name}</title>
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
	<link rel="canonical" href={`${site.url}${page.url.pathname}`} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content="Todo List" />
	<meta
		property="og:description"
		content="A persistent todo list application that helps you manage and track your tasks. Built with SvelteKit and TypeScript."
	/>
	<meta property="og:image" content={site.image} />
	<meta property="og:url" content={`${site.url}${page.url.pathname}`} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Todo List" />
	<meta
		name="twitter:description"
		content="A persistent todo list application that helps you manage and track your tasks. Built with SvelteKit and TypeScript."
	/>
	<meta name="twitter:image" content={site.image} />
</svelte:head>

<div class="container mx-auto p-6 dark:bg-gray-900">
	<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">To-Do List with Persistence</h1>
	<div class="mb-6 flex items-center space-x-4">
		<Input
			type="text"
			placeholder="Add a new todo"
			bind:value={newTodo}
			onkeydown={(e) => {
				if (e.key === 'Enter') addTodo();
			}}
			class="flex-grow rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<Button
			onclick={addTodo}
			class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-700"
			>Add</Button
		>
	</div>

	<!-- Custom Column Management -->
	<div class="mb-6 flex items-center space-x-4">
		<Input
			type="text"
			placeholder="Add new column"
			bind:value={newCustomColumn}
			onkeydown={(e) => {
				if (e.key === 'Enter') addCustomColumn();
			}}
			class="flex-grow rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<Button
			onclick={addCustomColumn}
			class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
			>Add Column</Button
		>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full table-auto border-collapse">
			<thead class="bg-gray-100 dark:bg-gray-700">
				<tr class="border-b dark:border-gray-700">
					<th class="p-4 text-left text-lg font-semibold text-gray-600 dark:text-gray-200"
						>Complete</th
					>
					<th class="p-4 text-left text-lg font-semibold text-gray-600 dark:text-gray-200">Task</th>
					{#each customColumns as column}
						<th class="p-4 text-left text-lg font-semibold text-gray-600 dark:text-gray-200">
							{#if editingColumn === column}
								<!-- Edit input field -->
								<Input
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
									class="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							{:else}
								<!-- Display column name -->
								<Button
									variant="ghost"
									onclick={() => editColumnName(column)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											editColumnName(column);
										}
									}}
									class="text-lg font-semibold text-gray-600 dark:text-gray-200"
								>
									{column}
								</Button>
							{/if}
						</th>
					{/each}
					<th class="p-4 text-left text-lg font-semibold text-gray-600 dark:text-gray-200"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody>
				{#each todos as todo (todo.id)}
					<tr class="border-b dark:border-gray-700">
						<td class="p-4">
							<Checkbox bind:checked={todo.completed} onchange={() => toggleTodo(todo.id)} />
						</td>
						<td class="p-4">
							<span class="text-gray-900 dark:text-white" class:line-through={todo.completed}>
								{todo.text}
							</span>
						</td>
						{#each customColumns as column}
							<td class="p-4">
								<Input
									type="text"
									value={todo[column]}
									onchange={(e) => {
										const target = e.target as HTMLInputElement;
										updateCustomValue(todo.id, column, target.value);
									}}
									class="w-full rounded-lg border border-gray-300 px-2 py-1 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</td>
						{/each}
						<td class="p-4">
							<Button
								onclick={() => deleteTodo(todo.id)}
								class="rounded-lg bg-red-600 px-2 py-1 font-semibold text-white shadow-md hover:bg-red-700"
								>Delete</Button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
