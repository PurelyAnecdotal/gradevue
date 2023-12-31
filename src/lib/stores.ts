import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { StudentAccount } from '$lib/synergy';
import type { Gradebook } from './Gradebook';
import type { Attendance } from './Attendance';

export const studentAccount: Writable<StudentAccount> = writable();

export const gradebook: Writable<Gradebook> | Writable<undefined> = writable(undefined);

export const gradebookLoaded = writable(false);

export const attendance: Writable<Attendance> | Writable<undefined> = writable(undefined);

export const attendanceLoaded = writable(false);