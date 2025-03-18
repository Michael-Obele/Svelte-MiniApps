<script lang="ts">
	import { Pencil, X } from 'lucide-svelte';
	import {
		FlexiBoard,
		FlexiTarget,
		FlexiWidget,
		type FlexiBoardController,
		type FlexiTargetController,
		type FlexiWidgetController,
		type FlexiWidgetChildrenSnippetParameters
	} from 'svelte-flexiboards';

	// Type definitions
	interface Todo {
		id: string;
		text: string;
		completed: boolean;
		columnId?: string;
	}

	interface Column {
		id: string;
		title: string;
		color: string;
		todos: Todo[];
	}

	// Generate a unique ID
	function generateId(): string {
		return Math.random().toString(36).substring(2, 12);
	}

	// State for board and columns
	let board: FlexiBoardController | undefined = $state();

	// Initial columns data
	let columns: Column[] = $state([
		{
			id: 'todo',
			title: 'To Do',
			color: 'bg-blue-300',
			todos: [
				{ id: generateId(), text: 'Learn Svelte 5', completed: false },
				{ id: generateId(), text: 'Build a Todo App', completed: false }
			]
		},
		{
			id: 'in-progress',
			title: 'In Progress',
			color: 'bg-amber-300',
			todos: [{ id: generateId(), text: 'Implement drag and drop', completed: false }]
		},
		{
			id: 'done',
			title: 'Done',
			color: 'bg-green-300',
			todos: [{ id: generateId(), text: 'Setup project', completed: true }]
		}
	]);

	// Function to add a new column
	function addColumn() {
		const newColumn: Column = {
			id: generateId(),
			title: 'New Column',
			color: 'bg-gray-300',
			todos: []
		};

		columns = [...columns, newColumn];
	}

	// Function to remove a column
	function removeColumn(columnId: string) {
		columns = columns.filter((col) => col.id !== columnId);
	}

	// Function to update a column title
	function updateColumnTitle(columnId: string, newTitle: string) {
		columns = columns.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col));
	}

	// Function to add a todo to a column
	function addTodo(columnId: string, text: string) {
		if (!text.trim()) return;

		columns = columns.map((col) => {
			if (col.id === columnId) {
				return {
					...col,
					todos: [
						...col.todos,
						{
							id: generateId(),
							text,
							completed: false,
							columnId
						}
					]
				};
			}
			return col;
		});
	}

	// Function to toggle todo completion status
	function toggleTodoCompleted(columnId: string, todoId: string) {
		columns = columns.map((col) => {
			if (col.id === columnId) {
				return {
					...col,
					todos: col.todos.map((todo) =>
						todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
					)
				};
			}
			return col;
		});
	}

	// Function to remove a todo
	function removeTodo(columnId: string, todoId: string) {
		columns = columns.map((col) => {
			if (col.id === columnId) {
				return {
					...col,
					todos: col.todos.filter((todo) => todo.id !== todoId)
				};
			}
			return col;
		});
	}

	// Function to update a todo text
	function updateTodoText(columnId: string, todoId: string, newText: string) {
		columns = columns.map((col) => {
			if (col.id === columnId) {
				return {
					...col,
					todos: col.todos.map((todo) => (todo.id === todoId ? { ...todo, text: newText } : todo))
				};
			}
			return col;
		});
	}

	// Theme classes
	const themeClasses = {
		target:
			'flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg p-2 min-w-[280px] w-full max-w-[500px] min-h-[200px] shadow-md',
		widget:
			'w-full p-3 my-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing',
		widgetActive: 'opacity-50 animate-pulse',
		widgetShadow: 'opacity-30'
	};

	// Global state variables (shared across all components)
	let titleEditing = $state(false);
	let newTitle = $state('');
	let addingTodo = $state(false);
	let newTodoText = $state('');
	let target = $state<FlexiTargetController>();
	let todoInputRef = $state<HTMLInputElement>();
	let inputRef = $state<HTMLInputElement>();
	let editing = $state(false);
	let editText = $state('');
	let editInputRef = $state<HTMLInputElement>();

	// Functions for KanbanColumn component
	function startEditingTitle(column: Column | null | undefined) {
		if (!column) return;
		titleEditing = true;
		newTitle = column.title || '';
	}

	function saveTitle(column: Column | null | undefined) {
		if (!column) return;
		if (newTitle.trim()) {
			updateColumnTitle(column.id, newTitle);
		}
		titleEditing = false;
	}

	function startAddingTodo(column: Column | null | undefined) {
		if (!column) return;
		addingTodo = true;
		newTodoText = '';
	}

	function saveTodo(column: Column | null | undefined) {
		if (!column) return;
		if (newTodoText.trim()) {
			addTodo(column.id, newTodoText);
			newTodoText = '';
		}
		addingTodo = false;
	}

	function cancelTodo(column: Column | null | undefined) {
		if (!column) return;
		addingTodo = false;
		newTodoText = '';
	}

	// Functions for TodoItem component
	function startEditingTodo(todo: Todo) {
		editing = true;
		editText = todo.text;
	}

	function saveTodoText(todo: Todo) {
		if (!todo.columnId) return;

		if (editText.trim()) {
			updateTodoText(todo.columnId, todo.id, editText);
		}
		editing = false;
	}
</script>

<div class="flex h-screen flex-col">
	<header class="flex items-center justify-between border-b bg-gray-100 p-4 dark:bg-gray-900">
		<h1 class="text-2xl font-bold">Kanban Todo List</h1>
		<button
			class="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
			onclick={addColumn}
		>
			Add Column
		</button>
	</header>

	<main class="flex-1 overflow-auto p-4">
		<div class="mx-auto flex max-w-[1600px] flex-wrap items-start justify-start gap-6">
			<FlexiBoard
				config={{
					targetDefaults: {
						layout: {
							type: 'flow',
							flowAxis: 'row',
							placementStrategy: 'append'
						}
					},
					widgetDefaults: {
						draggable: true
					}
				}}
				class="flex h-full w-full"
				bind:controller={board}
			>
				{#each columns as column (column.id)}
					<div class={themeClasses.target}>
						<div class="mb-2 flex items-center justify-between">
							{#if !titleEditing}
								<div class="flex items-center">
									<h3 class="flex-1 truncate text-lg font-semibold">
										{column?.title || 'Untitled'}
									</h3>
									<span class="ml-2 text-sm text-gray-500">{column?.todos?.length || 0}</span>
								</div>
								<div class="flex gap-1">
									<button
										class="rounded p-1 text-gray-500 hover:text-gray-700"
										onclick={() => startEditingTitle(column)}
										aria-label="Edit column title"
									>
										<Pencil class="size-4" />
									</button>
									<button
										class="rounded p-1 text-gray-500 hover:text-red-600"
										onclick={() => removeColumn(column.id)}
										aria-label="Remove column"
									>
										<X class="size-4" />
									</button>
								</div>
							{:else}
								<input
									type="text"
									bind:value={newTitle}
									class="flex-1 rounded border px-2 py-1"
									onkeydown={(e) => {
										if (e.key === 'Enter') saveTitle(column);
										if (e.key === 'Escape') titleEditing = false;
									}}
									onblur={() => saveTitle(column)}
								/>
							{/if}
						</div>

						<FlexiTarget
							key={column.id || 'empty-column'}
							class="min-h-[100px] flex-1 overflow-y-auto"
							bind:controller={target}
						>
							{#each column.todos as todo (todo.id)}
								<FlexiWidget
									class={(widget: FlexiWidgetController) => {
										return `${themeClasses.widget} ${widget.isGrabbed ? themeClasses.widgetActive : ''} ${widget.isShadow ? themeClasses.widgetShadow : ''}`;
									}}
								>
									<div class="flex items-start">
										{#if !editing}
											<input
												type="checkbox"
												checked={todo.completed}
												onchange={() => toggleTodoCompleted(column.id, todo.id)}
												class="mr-3 mt-1"
											/>
											<span class={todo.completed ? 'flex-1 text-gray-500 line-through' : 'flex-1'}>
												{todo.text}
											</span>
											<div class="ml-2 flex gap-1">
												<button
													class="rounded p-1 text-gray-500 hover:text-gray-700"
													onclick={() => startEditingTodo({ ...todo, columnId: column.id })}
													aria-label="Edit todo"
												>
													<Pencil class="size-4" />
												</button>
												<button
													class="rounded p-1 text-gray-500 hover:text-red-600"
													onclick={() => removeTodo(column.id, todo.id)}
													aria-label="Remove todo"
												>
													<X class="size-4" />
												</button>
											</div>
										{:else}
											<input
												type="text"
												bind:value={editText}
												class="w-full rounded border px-2 py-1"
												onkeydown={(e) => {
													if (e.key === 'Enter') saveTodoText({ ...todo, columnId: column.id });
													if (e.key === 'Escape') editing = false;
												}}
												onblur={() => saveTodoText({ ...todo, columnId: column.id })}
											/>
										{/if}
									</div>
								</FlexiWidget>
							{/each}

							{#if addingTodo}
								<div class="my-2 flex flex-col rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700">
									<input
										type="text"
										bind:value={newTodoText}
										placeholder="Enter a task..."
										class="mb-2 w-full rounded border px-2 py-1"
										onkeydown={(e) => {
											if (e.key === 'Enter') saveTodo(column);
											if (e.key === 'Escape') cancelTodo(column);
										}}
									/>
									<div class="flex justify-end gap-2">
										<button
											class="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
											onclick={() => cancelTodo(column)}
										>
											Cancel
										</button>
										<button
											class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
											onclick={() => saveTodo(column)}
										>
											Add
										</button>
									</div>
								</div>
							{:else}
								<button
									class="mt-2 w-full rounded-lg p-2 text-center text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
									onclick={() => startAddingTodo(column)}
								>
									+ Add Task
								</button>
							{/if}
						</FlexiTarget>
					</div>
				{/each}
			</FlexiBoard>
		</div>
	</main>
</div>
