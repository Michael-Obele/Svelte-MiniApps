import { PersistedState } from '$lib/persisted-state';
import { projects } from '$lib/index.svelte';

export let filter = new PersistedState('filter', 'done');


