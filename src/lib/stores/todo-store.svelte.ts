import { PersistedState } from 'runed';
import type { Column, Todo, TodoState, UIState } from '$lib/types';
import { v4 as uuidv4 } from 'uuid';

// Initialize with default values
const initialState: TodoState = {
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      todos: [
        { id: uuidv4(), text: 'Setup project', completed: false },
        { id: uuidv4(), text: 'Implement drag and drop', completed: false },
        { id: uuidv4(), text: 'Add persistence', completed: false }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      todos: [
        { id: uuidv4(), text: 'Create UI components', completed: false },
        { id: uuidv4(), text: 'Style with Tailwind', completed: false }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      todos: [
        { id: uuidv4(), text: 'Project planning', completed: true },
        { id: uuidv4(), text: 'Initial setup', completed: true }
      ]
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

// Create the persisted state
export const todoStore = new PersistedState<TodoState>('todo-list-state', initialState);

// Helper functions to update the state
export function addColumn(): void {
  const newColumn: Column = {
    id: uuidv4(),
    title: 'New Column',
    todos: []
  };
  
  // Use direct assignment with Svelte 5 reactivity
  todoStore.current = {
    ...todoStore.current,
    columns: [...todoStore.current.columns, newColumn]
  };
}

export function updateColumnTitle(columnId: string, newTitle: string): void {
  todoStore.current = {
    ...todoStore.current,
    columns: todoStore.current.columns.map((col) => 
      col.id === columnId ? { ...col, title: newTitle } : col
    )
  };
}

export function deleteColumn(columnId: string): void {
  todoStore.current = {
    ...todoStore.current,
    columns: todoStore.current.columns.filter((col) => col.id !== columnId)
  };
}

export function addTodo(columnId: string, text: string): void {
  const newTodo: Todo = {
    id: uuidv4(),
    text,
    completed: false
  };
  
  todoStore.current = {
    ...todoStore.current,
    columns: todoStore.current.columns.map((col) => 
      col.id === columnId 
        ? { ...col, todos: [...col.todos, newTodo] } 
        : col
    )
  };
}

export function updateTodoText(columnId: string, todoId: string, newText: string): void {
  todoStore.current = {
    ...todoStore.current,
    columns: todoStore.current.columns.map((col) => 
      col.id === columnId 
        ? {
            ...col,
            todos: col.todos.map((todo: Todo) => 
              todo.id === todoId ? { ...todo, text: newText } : todo
            )
          } 
        : col
    )
  };
}

export function toggleTodoCompleted(columnId: string, todoId: string): void {
  todoStore.current = {
    ...todoStore.current,
    columns: todoStore.current.columns.map((col) => 
      col.id === columnId 
        ? {
            ...col,
            todos: col.todos.map((todo: Todo) => 
              todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            )
          } 
        : col
    )
  };
}

export function deleteTodo(columnId: string, todoId: string): void {
  todoStore.current = {
    ...todoStore.current,
    columns: todoStore.current.columns.map((col) => 
      col.id === columnId 
        ? { ...col, todos: col.todos.filter((todo: Todo) => todo.id !== todoId) } 
        : col
    )
  };
}

export function moveTodo(fromColumnId: string, toColumnId: string, todoId: string): void {
  const fromColumn = todoStore.current.columns.find((col) => col.id === fromColumnId);
  const todo = fromColumn?.todos.find((t: Todo) => t.id === todoId);
  
  if (!fromColumn || !todo) return;
  
  // First remove the todo from the source column
  const columnsWithoutTodo = todoStore.current.columns.map((col) => 
    col.id === fromColumnId 
      ? { ...col, todos: col.todos.filter((t: Todo) => t.id !== todoId) } 
      : col
  );
  
  // Then add it to the destination column
  todoStore.current = {
    ...todoStore.current,
    columns: columnsWithoutTodo.map((col) => 
      col.id === toColumnId 
        ? { ...col, todos: [...col.todos, todo] } 
        : col
    )
  };
}

// UI state management
export function setEditingColumnTitle(columnId: string | null, title: string = ''): void {
  todoStore.current = {
    ...todoStore.current,
    ui: {
      ...todoStore.current.ui,
      titleEditing: columnId !== null,
      editingColumnId: columnId,
      newTitle: title
    }
  };
}

export function setAddingTodo(columnId: string | null, text: string = ''): void {
  todoStore.current = {
    ...todoStore.current,
    ui: {
      ...todoStore.current.ui,
      addingTodo: columnId !== null,
      addingToColumnId: columnId,
      newTodoText: text
    }
  };
}

export function setEditingTodo(columnId: string | null, todoId: string | null, text: string = ''): void {
  todoStore.current = {
    ...todoStore.current,
    ui: {
      ...todoStore.current.ui,
      editing: columnId !== null && todoId !== null,
      editColumnId: columnId,
      editTodoId: todoId,
      editTodoText: text
    }
  };
}

// Reset UI state
export function resetUIState(): void {
  todoStore.current = {
    ...todoStore.current,
    ui: {
      ...initialState.ui
    }
  };
}
