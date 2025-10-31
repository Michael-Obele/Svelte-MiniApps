import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PersistedState } from 'runed';
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

// Mock PersistedState
vi.mock('runed', () => ({
	PersistedState: class {
		constructor(key: string, defaultValue: any) {
			this.key = key;
			this.current = defaultValue;
		}
		key: string;
		current: any;
	}
}));

// Mock uuid
vi.mock('uuid', () => ({
	v4: vi.fn(() => 'mock-uuid')
}));

describe('Todo Store', () => {
	beforeEach(() => {
		// Reset the store to initial state before each test
		todoStore.current = {
			columns: [
				{
					id: 'todo',
					title: 'To Do',
					todos: [
						{ id: '1', text: 'Setup project', completed: false },
						{ id: '2', text: 'Implement drag and drop', completed: false }
					]
				},
				{
					id: 'in-progress',
					title: 'In Progress',
					todos: [{ id: '3', text: 'Create UI components', completed: false }]
				}
			],
			ui: {
				titleEditing: false,
				newTitle: '',
				editingColumnId: null,
				addingTodo: false,
				newTodoText: '',
				addingToColumnId: null,
				editing: false,
				editTodoId: null,
				editColumnId: null,
				editTodoText: ''
			}
		};
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Column Management', () => {
		it('should add a new column', () => {
			const initialColumnCount = todoStore.current.columns.length;

			addColumn();

			expect(todoStore.current.columns).toHaveLength(initialColumnCount + 1);
			const newColumn = todoStore.current.columns[todoStore.current.columns.length - 1];
			expect(newColumn.id).toBe('mock-uuid');
			expect(newColumn.title).toBe('New Column');
			expect(newColumn.todos).toEqual([]);
		});

		it('should update column title', () => {
			updateColumnTitle('todo', 'Updated To Do');

			const column = todoStore.current.columns.find((col) => col.id === 'todo');
			expect(column?.title).toBe('Updated To Do');
		});

		it('should not update title for non-existent column', () => {
			updateColumnTitle('non-existent', 'New Title');

			// Should not throw and state should remain unchanged
			expect(todoStore.current.columns.find((col) => col.id === 'todo')?.title).toBe('To Do');
		});

		it('should delete a column', () => {
			const initialColumnCount = todoStore.current.columns.length;

			deleteColumn('todo');

			expect(todoStore.current.columns).toHaveLength(initialColumnCount - 1);
			expect(todoStore.current.columns.find((col) => col.id === 'todo')).toBeUndefined();
		});

		it('should not delete non-existent column', () => {
			const initialColumnCount = todoStore.current.columns.length;

			deleteColumn('non-existent');

			expect(todoStore.current.columns).toHaveLength(initialColumnCount);
		});
	});

	describe('Todo Management', () => {
		it('should add a new todo to a column', () => {
			const initialTodoCount =
				todoStore.current.columns.find((col) => col.id === 'todo')?.todos.length || 0;

			addTodo('todo', 'New todo item');

			const column = todoStore.current.columns.find((col) => col.id === 'todo');
			expect(column?.todos).toHaveLength(initialTodoCount + 1);
			const newTodo = column?.todos[column.todos.length - 1];
			expect(newTodo?.id).toBe('mock-uuid');
			expect(newTodo?.text).toBe('New todo item');
			expect(newTodo?.completed).toBe(false);
		});

		it('should not add todo to non-existent column', () => {
			addTodo('non-existent', 'New todo');

			// Should not throw and no todos should be added
			const totalTodos = todoStore.current.columns.reduce((sum, col) => sum + col.todos.length, 0);
			expect(totalTodos).toBe(3); // Initial count
		});

		it('should update todo text', () => {
			updateTodoText('todo', '1', 'Updated project setup');

			const column = todoStore.current.columns.find((col) => col.id === 'todo');
			const todo = column?.todos.find((t) => t.id === '1');
			expect(todo?.text).toBe('Updated project setup');
		});

		it('should not update text for non-existent todo', () => {
			updateTodoText('todo', 'non-existent', 'New text');

			const column = todoStore.current.columns.find((col) => col.id === 'todo');
			const todo = column?.todos.find((t) => t.id === '1');
			expect(todo?.text).toBe('Setup project'); // Unchanged
		});

		it('should toggle todo completed status', () => {
			toggleTodoCompleted('todo', '1');

			let column = todoStore.current.columns.find((col) => col.id === 'todo');
			let todo = column?.todos.find((t) => t.id === '1');
			expect(todo?.completed).toBe(true);

			// Toggle again
			toggleTodoCompleted('todo', '1');
			column = todoStore.current.columns.find((col) => col.id === 'todo');
			todo = column?.todos.find((t) => t.id === '1');
			expect(todo?.completed).toBe(false);
		});

		it('should not toggle non-existent todo', () => {
			toggleTodoCompleted('todo', 'non-existent');

			// Should not throw and state should remain unchanged
			const column = todoStore.current.columns.find((col) => col.id === 'todo');
			const todo = column?.todos.find((t) => t.id === '1');
			expect(todo?.completed).toBe(false);
		});

		it('should delete a todo', () => {
			const initialTodoCount =
				todoStore.current.columns.find((col) => col.id === 'todo')?.todos.length || 0;

			deleteTodo('todo', '1');

			const column = todoStore.current.columns.find((col) => col.id === 'todo');
			expect(column?.todos).toHaveLength(initialTodoCount - 1);
			expect(column?.todos.find((t) => t.id === '1')).toBeUndefined();
		});

		it('should not delete non-existent todo', () => {
			const initialTodoCount =
				todoStore.current.columns.find((col) => col.id === 'todo')?.todos.length || 0;

			deleteTodo('todo', 'non-existent');

			const column = todoStore.current.columns.find((col) => col.id === 'todo');
			expect(column?.todos).toHaveLength(initialTodoCount);
		});

		it('should move todo between columns', () => {
			const fromColumn = todoStore.current.columns.find((col) => col.id === 'todo');
			const toColumn = todoStore.current.columns.find((col) => col.id === 'in-progress');
			const initialFromCount = fromColumn?.todos.length || 0;
			const initialToCount = toColumn?.todos.length || 0;

			moveTodo('todo', 'in-progress', '1');

			const updatedFromColumn = todoStore.current.columns.find((col) => col.id === 'todo');
			const updatedToColumn = todoStore.current.columns.find((col) => col.id === 'in-progress');

			expect(updatedFromColumn?.todos).toHaveLength(initialFromCount - 1);
			expect(updatedToColumn?.todos).toHaveLength(initialToCount + 1);
			expect(updatedToColumn?.todos.find((t) => t.id === '1')).toBeDefined();
			expect(updatedFromColumn?.todos.find((t) => t.id === '1')).toBeUndefined();
		});

		it('should not move non-existent todo', () => {
			const initialTotalTodos = todoStore.current.columns.reduce(
				(sum, col) => sum + col.todos.length,
				0
			);

			moveTodo('todo', 'in-progress', 'non-existent');

			const finalTotalTodos = todoStore.current.columns.reduce(
				(sum, col) => sum + col.todos.length,
				0
			);
			expect(finalTotalTodos).toBe(initialTotalTodos);
		});
	});

	describe('UI State Management', () => {
		it('should set editing column title', () => {
			setEditingColumnTitle('todo', 'New Title');

			expect(todoStore.current.ui.titleEditing).toBe(true);
			expect(todoStore.current.ui.editingColumnId).toBe('todo');
			expect(todoStore.current.ui.newTitle).toBe('New Title');
		});

		it('should reset editing column title when null', () => {
			setEditingColumnTitle(null);

			expect(todoStore.current.ui.titleEditing).toBe(false);
			expect(todoStore.current.ui.editingColumnId).toBe(null);
			expect(todoStore.current.ui.newTitle).toBe('');
		});

		it('should set adding todo', () => {
			setAddingTodo('todo', 'New todo text');

			expect(todoStore.current.ui.addingTodo).toBe(true);
			expect(todoStore.current.ui.addingToColumnId).toBe('todo');
			expect(todoStore.current.ui.newTodoText).toBe('New todo text');
		});

		it('should reset adding todo when null', () => {
			setAddingTodo(null);

			expect(todoStore.current.ui.addingTodo).toBe(false);
			expect(todoStore.current.ui.addingToColumnId).toBe(null);
			expect(todoStore.current.ui.newTodoText).toBe('');
		});

		it('should set editing todo', () => {
			setEditingTodo('todo', '1', 'Edited text');

			expect(todoStore.current.ui.editing).toBe(true);
			expect(todoStore.current.ui.editColumnId).toBe('todo');
			expect(todoStore.current.ui.editTodoId).toBe('1');
			expect(todoStore.current.ui.editTodoText).toBe('Edited text');
		});

		it('should reset editing todo when null', () => {
			setEditingTodo(null, null);

			expect(todoStore.current.ui.editing).toBe(false);
			expect(todoStore.current.ui.editColumnId).toBe(null);
			expect(todoStore.current.ui.editTodoId).toBe(null);
			expect(todoStore.current.ui.editTodoText).toBe('');
		});

		it('should reset UI state', () => {
			// Set some UI state
			todoStore.current.ui = {
				titleEditing: true,
				newTitle: 'Test',
				editingColumnId: 'test',
				addingTodo: true,
				newTodoText: 'Test todo',
				addingToColumnId: 'test',
				editing: true,
				editTodoId: 'test',
				editColumnId: 'test',
				editTodoText: 'Test edit'
			};

			resetUIState();

			expect(todoStore.current.ui.titleEditing).toBe(false);
			expect(todoStore.current.ui.newTitle).toBe('');
			expect(todoStore.current.ui.editingColumnId).toBe(null);
			expect(todoStore.current.ui.addingTodo).toBe(false);
			expect(todoStore.current.ui.newTodoText).toBe('');
			expect(todoStore.current.ui.addingToColumnId).toBe(null);
			expect(todoStore.current.ui.editing).toBe(false);
			expect(todoStore.current.ui.editTodoId).toBe(null);
			expect(todoStore.current.ui.editColumnId).toBe(null);
			expect(todoStore.current.ui.editTodoText).toBe('');
		});
	});

	describe('Store Initialization', () => {
		it('should initialize with default columns and todos', () => {
			// The store is initialized in the module, so we check the structure
			expect(todoStore.current.columns).toHaveLength(2);
			expect(todoStore.current.columns[0].title).toBe('To Do');
			expect(todoStore.current.columns[1].title).toBe('In Progress');
			expect(todoStore.current.ui.titleEditing).toBe(false);
		});
	});
});
