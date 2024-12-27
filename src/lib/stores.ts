import type { Gradebook } from '$lib/types/Gradebook';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export const gradebook: Writable<Gradebook | undefined> = writable();

export const gradebookLoaded = writable(false);
