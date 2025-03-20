<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { FlexiWidgetProps } from 'svelte-flexiboards';
	import type { Todo } from '../../../routes/apps/(app)/todo-list/+page.svelte';

	type TodoItemProps = FlexiWidgetProps & {
		todo: Todo;
		columnId: string;
		onEdit: (todo: Todo, columnId: string) => void;
		onDelete: (todoId: string, columnId: string) => void;
		children?: Snippet<[{ widget: FlexiWidgetProps }]>;
	};
</script>

<script lang="ts">
	import { FlexiWidget } from 'svelte-flexiboards';
	import { Pencil, X } from 'lucide-svelte';
	import Grabber from '../common/grabber.svelte';

	let { todo, columnId, onEdit, onDelete, ...props }: TodoItemProps = $props();
</script>

<FlexiWidget
	{...props}
	class={(widget) => [
		'flex items-center p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm',
		widget.isGrabbed && 'animate-pulse opacity-50',
		widget.isShadow && 'opacity-50'
	]}
>
	{#snippet children({ widget })}
		<div class="flex w-full items-center justify-between">
			<div class="flex items-center gap-2">
				{#if widget.draggable}
					<Grabber size={16} class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
				{/if}
				<input
					type="checkbox"
					checked={todo.completed}
					onclick={(e) => e.stopPropagation()}
					onchange={() => {
						// We'll handle this in the parent component
						const event = new CustomEvent('toggleComplete', {
							detail: { todoId: todo.id, columnId }
						});
						document.dispatchEvent(event);
					}}
					class="pointer-events-auto relative z-10 mr-2 cursor-pointer"
				/>
				<span class={todo.completed ? 'flex-1 text-gray-500 line-through' : 'flex-1 truncate'}>
					{todo.text}
				</span>
			</div>
			<div class="flex items-center gap-1">
				<button
					class="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
					onclick={() => onEdit(todo, columnId)}
					aria-label="Edit todo"
				>
					<Pencil size={16} />
				</button>
				<button
					class="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
					onclick={() => onDelete(todo.id, columnId)}
					aria-label="Delete todo"
				>
					<X size={16} />
				</button>
			</div>
		</div>
	{/snippet}
</FlexiWidget>
