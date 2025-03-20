export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Column {
  id: string;
  title: string;
  todos: Todo[];
}

export interface TodoItemProps {
  todo: Todo;
  columnId: string;
  onEdit: (todo: Todo, columnId: string) => void;
  onDelete: (todoId: string, columnId: string) => void;
  [key: string]: any;
}

export interface UIState {
  // Column editing
  titleEditing: boolean;
  editingColumnId: string | null;
  newTitle: string;
  
  // Todo editing
  editing: boolean;
  editTodoId: string | null;
  editColumnId: string | null;
  editTodoText: string;
  
  // Adding todo
  addingTodo: boolean;
  addingToColumnId: string | null;
  newTodoText: string;
}

export interface TodoState {
  columns: Column[];
  ui: UIState;
}

export interface SlotItemMap {
  column: Column;
  todo: Todo;
  [key: string]: any;
}
