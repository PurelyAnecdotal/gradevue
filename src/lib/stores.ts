import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { StudentAccount } from '$lib/synergy';

export const studentAccount: Writable<StudentAccount> = writable();
