<script lang="ts">
	import { site } from '$lib';
	import { page } from '$app/state';
	import RouteHead from '$lib/components/RouteHead.svelte';
	import { X, Pencil } from 'lucide-svelte';
	import { Button } from '@/ui/button';
	import Input from '@/ui/input/input.svelte';
	import { Checkbox } from '@/ui/checkbox';
	import { flip } from 'svelte/animate';
	import type { DndEvent } from 'svelte-dnd-action';
	import { dndzone } from 'svelte-dnd-action';

	interface Todo {
		id: number;
		text: string;
		completed: boolean;
		columnId: string;
		order: number;
		[key: string]: string | number | boolean;
	}

	interface Column {
		id: string;
		title: string;
		color: string;
	}

	let todos: Todo[] = $state([]);
	let columns: Column[] = $state([
		{ id: 'todo', title: 'To Do', color: 'bg-blue-500' },
		{ id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
		{ id: 'done', title: 'Done', color: 'bg-green-500' }
	]);
	let newTodo = $state('');
	let newColumnTitle = $state('');
	let editingColumnId: string = $state('');
	let newColumnName = $state('');
	let selectedColumnForTodo = $state('todo'); // Default column for new todos

	// Configuration for dnd
	const flipDurationMs = 300;

	// Load data from local storage on component mount
	if (typeof localStorage !== 'undefined') {
		const storedTodos = localStorage.getItem('kanban-todos');
		const storedColumns = localStorage.getItem('kanban-columns');
		if (storedTodos) {
			todos = JSON.parse(storedTodos);
		}
		if (storedColumns) {
			columns = JSON.parse(storedColumns);
		}
	}

	// Get todos for a specific column
	function getColumnTodos(columnId: string): Todo[] {
		return todos.filter((todo) => todo.columnId === columnId);
	}

	function addTodo() {
		if (newTodo.trim() === '') return;
		const newTodoObj: Todo = {
			id: Date.now(),
			text: newTodo,
			completed: false,
			columnId: selectedColumnForTodo,
			order: getColumnTodos(selectedColumnForTodo).length
		};
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

	function addColumn() {
		if (newColumnTitle.trim() === '') return;
		const randomColor = getRandomColor();
		const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, '-');

		columns = [
			...columns,
			{
				id: newColumnId,
				title: newColumnTitle,
				color: randomColor
			}
		];

		newColumnTitle = '';
		saveColumns();
	}

	function getRandomColor(): string {
		const colors = [
			'bg-blue-500',
			'bg-green-500',
			'bg-yellow-500',
			'bg-purple-500',
			'bg-pink-500',
			'bg-indigo-500',
			'bg-red-500',
			'bg-orange-500',
			'bg-teal-500'
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}

	function removeColumn(columnId: string) {
		if (
			confirm(
				`Are you sure you want to remove this column? All tasks in the column will be deleted.`
			)
		) {
			columns = columns.filter((col) => col.id !== columnId);
			// Remove todos in this column
			todos = todos.filter((todo) => todo.columnId !== columnId);
			saveColumns();
			saveTodos();
		}
	}

	function saveTodos() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('kanban-todos', JSON.stringify(todos));
		}
	}

	function saveColumns() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('kanban-columns', JSON.stringify(columns));
		}
	}

	// Function to start editing a column name
	function editColumnName(column: Column) {
		editingColumnId = column.id;
		newColumnName = column.title;
	}

	// Function to save the edited column name
	function saveColumnName() {
		if (newColumnName.trim() === '') return;
		columns = columns.map((column) =>
			column.id === editingColumnId ? { ...column, title: newColumnName } : column
		);
		editingColumnId = '';
		newColumnName = '';
		saveColumns();
	}

	// DND event handlers for column reordering
	function handleColumnDndConsider(e: CustomEvent<DndEvent>) {
		columns = e.detail.items as Column[];
	}

	function handleColumnDndFinalize(e: CustomEvent<DndEvent>) {
		columns = e.detail.items as Column[];
		saveColumns();
	}

	// DND event handlers for todo items within a column
	function handleTodoDndConsider(e: CustomEvent<DndEvent>, columnId: string) {
		const { items } = e.detail;
		todos = todos.map((todo) =>
			todo.columnId === columnId
				? (items.find((item) => item.id === todo.id) as Todo) || todo
				: todo
		);
	}

	// DND handlers for moving todos between columns
	function handleCrossColumnDrop(e: CustomEvent<DndEvent>, targetColumnId: string) {
		const { items: newItems, info } = e.detail;

		// Type guard to ensure info.source exists and has columnId property
		if (
			info?.source &&
			typeof info.source === 'object' &&
			info.source !== null &&
			'columnId' in info.source &&
			(info.source as { columnId: string }).columnId !== targetColumnId
		) {
			// Item is coming from another column
			const draggedItemId = Number(info.id);

			todos = todos.map((todo) => {
				if (todo.id === draggedItemId) {
					return { ...todo, columnId: targetColumnId };
				}
				return todo;
			});
		}

		// Update the order within the target column
		const updatedColumnTodos = (newItems as Todo[]).map((item, index) => ({
			...item,
			order: index
		}));

		todos = [...todos.filter((todo) => todo.columnId !== targetColumnId), ...updatedColumnTodos];

		saveTodos();
	}
</script>

<RouteHead
	title="Kanban Todo Board | {site.name}"
	description="A drag-and-drop Kanban board for task management. Built with SvelteKit and TypeScript."
	keywords="kanban, todo list, task management, drag-and-drop, svelte, sveltekit, typescript"
	route={page.url.pathname}
/>

<div class="container mx-auto p-6 dark:bg-gray-900">
	<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Kanban Task Board</h1>

	<!-- Add new task form -->
	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="md:col-span-2">
			<Input
				type="text"
				placeholder="Add a new task"
				bind:value={newTodo}
				onkeydown={(e) => {
					if (e.key === 'Enter') addTodo();
				}}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
		</div>
		<div class="flex items-center gap-2">
			<select
				bind:value={selectedColumnForTodo}
				class="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				{#each columns as column}
					<option value={column.id}>{column.title}</option>
				{/each}
			</select>
			<Button
				onclick={addTodo}
				class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-700"
			>
				Add Task
			</Button>
		</div>
	</div>

	<!-- Add new column form -->
	<div class="mb-6 flex items-center space-x-4">
		<Input
			type="text"
			placeholder="Add new column"
			bind:value={newColumnTitle}
			onkeydown={(e) => {
				if (e.key === 'Enter') addColumn();
			}}
			class="flex-grow rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<Button
			onclick={addColumn}
			class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
		>
			Add Column
		</Button>
	</div>

	<!-- Kanban Board -->
	<div
		class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
		use:dndzone={{ items: columns, flipDurationMs, type: 'column' }}
		onconsider={handleColumnDndConsider}
		onfinalize={handleColumnDndFinalize}
	>
		{#each columns as column (column.id)}
			<div
				animate:flip={{ duration: flipDurationMs }}
				class="flex flex-col rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
			>
				<!-- Column Header -->
				<div
					class={`flex items-center justify-between rounded-t-lg p-3 ${column.color} bg-opacity-90 text-white`}
				>
					{#if editingColumnId === column.id}
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
							class="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					{:else}
						<h2 class="text-lg font-bold">{column.title}</h2>
						<div class="flex items-center space-x-2">
							<button
								class="rounded-full p-1 hover:bg-white hover:bg-opacity-20"
								onclick={() => editColumnName(column)}
								aria-label="Edit column name"
							>
								<Pencil size={16} />
							</button>
							<button
								class="rounded-full p-1 hover:bg-white hover:bg-opacity-20"
								onclick={() => removeColumn(column.id)}
								aria-label="Remove column"
							>
								<X size={16} />
							</button>
						</div>
					{/if}
				</div>

				<!-- Todo List -->
				<div
					class="flex-1 overflow-y-auto p-3"
					style="min-height: 200px; max-height: 70vh;"
					use:dndzone={{
						items: getColumnTodos(column.id),
						flipDurationMs,
						dropFromOthersDisabled: false,
						type: 'task',
						dropTargetStyle: {
							outline: '2px dashed #4299e1',
							backgroundColor: 'rgba(66, 153, 225, 0.1)'
						}
					}}
					onconsider={(e) => handleTodoDndConsider(e, column.id)}
					onfinalize={(e) => handleCrossColumnDrop(e, column.id)}
					data-column-id={column.id}
				>
					{#each getColumnTodos(column.id) as todo (todo.id)}
						<div
							animate:flip={{ duration: flipDurationMs }}
							class="mb-3 cursor-move rounded-lg bg-white p-3 shadow hover:shadow-md dark:bg-gray-700"
						>
							<div class="flex items-start justify-between">
								<div class="flex flex-1 items-center">
									<Checkbox
										bind:checked={todo.completed}
										onchange={() => toggleTodo(todo.id)}
										class="mr-2"
									/>
									<p
										class={`flex-1 text-gray-900 dark:text-white ${todo.completed ? 'line-through opacity-70' : ''}`}
									>
										{todo.text}
									</p>
								</div>
								<button
									onclick={() => deleteTodo(todo.id)}
									class="ml-2 rounded-full p-1 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900"
									aria-label="Delete task"
								>
									<X size={14} />
								</button>
							</div>
						</div>
					{:else}
						<div class="flex h-20 items-center justify-center text-gray-500 dark:text-gray-400">
							<p>No tasks in this column</p>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	:global(.sortable-ghost) {
		opacity: 0.4;
	}

	:global(.task-drag-active) {
		cursor: grabbing !important;
	}
</style>
