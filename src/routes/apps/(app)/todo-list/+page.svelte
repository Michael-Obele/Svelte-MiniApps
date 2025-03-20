<script lang="ts">
	import { onMount } from 'svelte';
	import { FlexiBoard, FlexiTarget, FlexiWidget } from 'svelte-flexiboards';
	import { Plus, X, Edit, Check } from 'lucide-svelte';
	import TodoItem from '$lib/components/todo/todo-item.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import {
		todoStore,
		addColumn,
		updateColumnTitle,
		deleteColumn,
		addTodo,
		updateTodoText,
		deleteTodo,
		moveTodo,
		setEditingColumnTitle,
		setAddingTodo,
		setEditingTodo,
		resetUIState,
		toggleTodoCompleted
	} from '$lib/stores/todo-store.svelte';
	import type { Column, Todo, SlotItemMap } from '$lib/types';

	// Reactive reference to the store's current value
	let state = $derived(todoStore.current);
	let columns = $derived(state.columns);
	let ui = $derived(state.ui);

	// Keyboard event handlers for the edit modal
	function handleEditKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveEdit();
		} else if (e.key === 'Escape') {
			cancelEdit();
		}
	}

	// Save the edited todo
	function saveEdit() {
		if (ui.editTodoId && ui.editColumnId && ui.editTodoText.trim()) {
			updateTodoText(ui.editColumnId, ui.editTodoId, ui.editTodoText);
			resetUIState();
		}
	}

	// Cancel the edit
	function cancelEdit() {
		resetUIState();
	}

	// Handle edit button click
	function handleEditTodo(todo: Todo, columnId: string) {
		setEditingTodo(columnId, todo.id, todo.text);
	}

	// Handle delete button click
	function handleDeleteTodo(todoId: string, columnId: string) {
		deleteTodo(columnId, todoId);
	}

	// Handle column title edit
	function editColumnName(columnId: string) {
		const column = columns.find((col) => col.id === columnId);
		if (column) {
			setEditingColumnTitle(columnId, column.title);
		}
	}

	// Save column title edit
	function saveColumnName() {
		if (ui.editingColumnId && ui.newTitle.trim()) {
			updateColumnTitle(ui.editingColumnId, ui.newTitle);
			resetUIState();
		}
	}

	// Handle column delete
	function handleDeleteColumn(columnId: string) {
		deleteColumn(columnId);
	}

	// Handle adding a new todo
	function handleAddTodo(columnId: string) {
		setAddingTodo(columnId);
	}

	// Save new todo
	function saveNewTodo() {
		if (ui.addingToColumnId && ui.newTodoText.trim()) {
			addTodo(ui.addingToColumnId, ui.newTodoText);
			resetUIState();
		}
	}

	// Handle drag and drop
	function handleDrop(e: CustomEvent) {
		const { fromTarget, toTarget, widget } = e.detail;
		if (!fromTarget || !toTarget || !widget || !widget.element) return;
		
		// Find the parent div with the data-todo-id attribute
		const todoElement = widget.element.closest('[data-todo-id]');
		if (!todoElement) return;
		
		const todoId = todoElement.getAttribute('data-todo-id');
		const fromColumnId = fromTarget.id;
		const toColumnId = toTarget.id;

		if (fromColumnId && toColumnId && todoId) {
			moveTodo(fromColumnId, toColumnId, todoId);
		}
	}

	// Listen for toggle complete events
	onMount(() => {
		const handleToggleComplete = (e: CustomEvent) => {
			const { todoId, columnId } = e.detail;
			if (todoId && columnId) {
				toggleTodoCompleted(columnId, todoId);
			}
		};

		document.addEventListener('toggleComplete', handleToggleComplete as EventListener);

		return () => {
			document.removeEventListener('toggleComplete', handleToggleComplete as EventListener);
		};
	});

	// Theme classes for styling
	const themeClasses = {
		target: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm w-80 h-full flex flex-col'
	};
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold dark:text-white">Todo List</h1>
		<Button onclick={() => addColumn()}>
			<Plus class="mr-2" size={16} />
			Add Column
		</Button>
	</div>

	<div class="flex-1 overflow-x-auto">
		<FlexiBoard
			class="flex min-h-[calc(100vh-200px)] gap-4 p-4"
		>
			{#each columns as column (column?.id)}
				<div>
					<Card.Root class={themeClasses.target}>
						<Card.Header class="flex items-center justify-between p-2">
							{#if ui.titleEditing && ui.editingColumnId === column?.id}
								<div class="flex w-full items-center">
									<Input
										value={ui.newTitle}
										onchange={(e) => {
											todoStore.current = {
												...todoStore.current,
												ui: {
													...todoStore.current.ui,
													newTitle: e.currentTarget.value
												}
											};
										}}
										onkeydown={(e) => {
											if (e.key === 'Enter') {
												saveColumnName();
											} else if (e.key === 'Escape') {
												resetUIState();
											}
										}}
										class="flex-1"
									/>
									<Button variant="ghost" size="icon" onclick={() => saveColumnName()} class="ml-2">
										<Check size={16} />
									</Button>
									<Button variant="ghost" size="icon" onclick={() => resetUIState()} class="ml-1">
										<X size={16} />
									</Button>
								</div>
							{:else}
								<div class="flex w-full items-center justify-between">
									<div class="flex items-center">
										<h3 class="mr-2 text-lg font-medium">{column?.title}</h3>
										<span class="text-sm text-gray-500">
											{#if column?.todos?.length > 0}
												<span class="font-medium text-green-500">
													{column?.todos?.filter((t) => t.completed).length}
												</span>/{column?.todos?.length}
											{:else}
												0/0
											{/if}
										</span>
									</div>
									<div class="flex">
										<Button
											variant="ghost"
											size="icon"
											onclick={() => column?.id && editColumnName(column.id)}
										>
											<Edit size={16} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => column?.id && handleDeleteColumn(column.id)}
										>
											<X size={16} />
										</Button>
									</div>
								</div>
							{/if}
						</Card.Header>

						<FlexiTarget
							key={column?.id || 'empty-column'}
							class={`min-h-[100px] flex-1 overflow-y-auto transition-all duration-300 ${
								column?.todos?.some((t) => t.completed) ? 'bg-green-50/20 dark:bg-green-900/10' : ''
							}`}
						>
							{#each column?.todos || [] as todo (todo.id)}
								<div data-todo-id={todo.id}>
									<FlexiWidget
										metadata={{ todo, columnId: column?.id }}
									>
										<TodoItem
											todo={todo}
											columnId={column?.id || ''}
											onEdit={handleEditTodo}
											onDelete={handleDeleteTodo}
										/>
									</FlexiWidget>
								</div>
							{/each}
						</FlexiTarget>

						<div class="p-2">
							{#if ui.addingTodo && ui.addingToColumnId === column?.id}
								<div class="mt-2 flex items-center">
									<Input
										value={ui.newTodoText}
										placeholder="Enter todo text..."
										onchange={(e) => {
											todoStore.current = {
												...todoStore.current,
												ui: {
													...todoStore.current.ui,
													newTodoText: e.currentTarget.value
												}
											};
										}}
										onkeydown={(e) => {
											if (e.key === 'Enter') {
												saveNewTodo();
											} else if (e.key === 'Escape') {
												resetUIState();
											}
										}}
										class="flex-1"
									/>
									<Button variant="ghost" size="icon" onclick={() => saveNewTodo()} class="ml-2">
										<Check size={16} />
									</Button>
									<Button variant="ghost" size="icon" onclick={() => resetUIState()} class="ml-1">
										<X size={16} />
									</Button>
								</div>
							{:else}
								<Button
									variant="outline"
									class="mt-2 w-full"
									onclick={() => column?.id && handleAddTodo(column.id)}
								>
									<Plus size={16} class="mr-2" />
									Add Todo
								</Button>
							{/if}
						</div>
					</Card.Root>
				</div>
			{/each}
		</FlexiBoard>
	</div>
</div>

<!-- Edit Todo Modal -->
{#if ui.editing}
	<AlertDialog.Root open={ui.editing}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Edit Todo</AlertDialog.Title>
				<AlertDialog.Description>
					<Input
						value={ui.editTodoText}
						onchange={(e) => {
							todoStore.current = {
								...todoStore.current,
								ui: {
									...todoStore.current.ui,
									editTodoText: e.currentTarget.value
								}
							};
						}}
						onkeydown={handleEditKeydown}
						class="mb-4 w-full"
					/>
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={cancelEdit}>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action onclick={saveEdit}>Save</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
