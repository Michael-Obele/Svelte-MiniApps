<script lang="ts">
	import { FlexiWidget } from 'svelte-flexiboards';
	import { Pencil, X, CheckCircle2 } from 'lucide-svelte';
	import Grabber from '../common/grabber.svelte';
	import { toggleTodoCompleted } from '$lib/stores/todo-store.svelte';
	import type { Todo } from '$lib/types';
	import type { Snippet } from 'svelte';
	import type { FlexiWidgetProps } from 'svelte-flexiboards';

	// Define props interface
	interface Props extends FlexiWidgetProps {
		todo: Todo;
		columnId: string;
		onEdit: (todo: Todo, columnId: string) => void;
		onDelete: (todoId: string, columnId: string) => void;
		children?: Snippet<[{ widget: FlexiWidgetProps }]>;
	}

	// Use $props() with type annotation instead of generic
	let { todo, columnId, onEdit, onDelete, ...props }: Props = $props();
	let showCompletionIcon: boolean = $state(false);
	let isCompleted: boolean = $state(todo.completed);
	
	// Update isCompleted when todo.completed changes
	$effect(() => {
		isCompleted = todo.completed;
	});
	
	// Show completion icon briefly when item is checked
	$effect(() => {
		if (isCompleted) {
			showCompletionIcon = true;
			const timer = setTimeout(() => {
				showCompletionIcon = false;
			}, 1500);
			
			return () => clearTimeout(timer);
		}
	});
	
	function handleCheckboxChange() {
		// Immediately update local state for instant visual feedback
		isCompleted = !isCompleted;
		
		// Update the centralized state
		toggleTodoCompleted(columnId, todo.id);
	}
</script>

<FlexiWidget
	{...props}
	class={(widget) => [
		'flex items-center p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm transition-all duration-300',
		isCompleted && 'bg-gray-50 border-l-4 border-green-500 dark:bg-gray-900',
		widget.isGrabbed && 'animate-pulse opacity-50',
		widget.isShadow && 'opacity-50'
	]}
>
	{#snippet children({ widget })}
		<div class="flex w-full items-center justify-between">
			<div class="flex items-center gap-2 relative">
				{#if widget.draggable}
					<Grabber size={16} class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
				{/if}
				<input
					type="checkbox"
					checked={isCompleted}
					onclick={(e) => e.stopPropagation()}
					onchange={handleCheckboxChange}
					class="pointer-events-auto relative z-10 mr-2 h-4 w-4 cursor-pointer rounded border-gray-300 text-green-500 focus:ring-green-500 dark:border-gray-600"
				/>
				{#if showCompletionIcon}
					<div class="absolute left-6 top-0 animate-bounce text-green-500">
						<CheckCircle2 size={16} />
					</div>
				{/if}
				<span class={isCompleted 
					? 'flex-1 text-gray-500 line-through font-medium transition-all duration-300' 
					: 'flex-1 truncate transition-all duration-300'}>
					{todo.text}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<button
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-400"
					onclick={(e) => {
						e.stopPropagation();
						onEdit(todo, columnId);
					}}
					aria-label="Edit todo"
				>
					<Pencil size={16} />
				</button>
				<button
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700 dark:hover:text-red-400"
					onclick={(e) => {
						e.stopPropagation();
						onDelete(todo.id, columnId);
					}}
					aria-label="Delete todo"
				>
					<X size={16} />
				</button>
			</div>
		</div>
	{/snippet}
</FlexiWidget>
