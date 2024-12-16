<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { sitename, siteurl, siteimage } from '$lib';
	import { page } from '$app/stores';

	let todos: { id: number; text: string; completed: boolean }[] = $state([]);
	let newTodo = $state('');

	// Load todos from local storage on component mount
	if (typeof localStorage !== 'undefined') {
		const storedTodos = localStorage.getItem('todos');
		if (storedTodos) {
			todos = JSON.parse(storedTodos);
		}
	}

	function addTodo() {
		if (newTodo.trim() === '') return;
		todos = [...todos, { id: Date.now(), text: newTodo, completed: false }];
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

	function saveTodos() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('todos', JSON.stringify(todos));
		}
	}
</script>

<svelte:head>
	<title>Todo List | {sitename}</title>
	<meta
		name="description"
		content="A persistent todo list application that helps you manage and track your tasks. Built with SvelteKit and TypeScript."
	/>

	<!-- Viewport -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />

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
	<ul class="space-y-2">
		{#each todos as todo (todo.id)}
			<li
				class="flex items-center border-b border-gray-200 p-2 dark:border-gray-700"
				class:completed={todo.completed}
			>
				<input
					type="checkbox"
					checked={todo.completed}
					onchange={() => toggleTodo(todo.id)}
					class="mr-2"
				/>
				<span class="flex-grow text-gray-900 dark:text-white" class:line-through={todo.completed}
					>{todo.text}</span
				>
				<button
					onclick={() => deleteTodo(todo.id)}
					class="rounded bg-red-500 px-2 py-1 font-bold text-white hover:bg-red-700">Delete</button
				>
			</li>
		{/each}
	</ul>
</div>

<style>
	.line-through {
		text-decoration: line-through;
		color: #888;
	}
</style>
