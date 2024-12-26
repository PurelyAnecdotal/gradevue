import type { StudentAccount } from '$lib/synergy';
import type { Attendance } from '$lib/types/Attendance';
import type { Documents } from '$lib/types/Documents';
import type { Gradebook } from '$lib/types/Gradebook';
import type { MailData } from '$lib/types/MailData';
import type { StudentInfo } from '$lib/types/StudentInfo';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export const studentAccount: Writable<StudentAccount | undefined> = writable();

export const gradebook: Writable<Gradebook | undefined> = writable();

export const gradebookLoaded = writable(false);

export const attendance: Writable<Attendance | undefined> = writable();

export const attendanceLoaded = writable(false);

export const studentInfo: Writable<StudentInfo | undefined> = writable();

export const studentInfoLoaded = writable(false);

export const documents: Writable<Documents | undefined> = writable();

export const documentsLoaded = writable(false);

export const mailData: Writable<MailData | undefined> = writable();

export const mailDataLoaded = writable(false);
