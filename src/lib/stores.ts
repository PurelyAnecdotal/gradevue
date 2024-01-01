import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { StudentAccount } from '$lib/synergy';
import type { Gradebook } from './Gradebook';
import type { Attendance } from './Attendance';

export const studentAccount: Writable<StudentAccount | undefined> = writable();

export const gradebook: Writable<Gradebook | undefined> = writable();

export const gradebookLoaded = writable(false);

export const attendance: Writable<Attendance | undefined> = writable();

export const attendanceLoaded = writable(false);