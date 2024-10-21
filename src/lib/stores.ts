import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import type { StudentAccount } from '$lib/synergy';
import type { Attendance } from '$lib/types/Attendance';
import type { DocumentsList } from '$lib/types/DocumentsList';
import type { Gradebook } from '$lib/types/Gradebook';
import type { ReportCardListEntity } from '$lib/types/ReportCardListEntity';
import type { StudentInfo } from '$lib/types/StudentInfo';
import type { MailData } from '$lib/types/MailData';
import type { Message } from '$lib/types/Message';

export const studentAccount: Writable<StudentAccount | undefined> = writable();

export const gradebook: Writable<Gradebook | undefined> = writable();

export const gradebookLoaded = writable(false);

export const attendance: Writable<Attendance | undefined> = writable();

export const attendanceLoaded = writable(false);

export const studentInfo: Writable<StudentInfo | undefined> = writable();

export const studentInfoLoaded = writable(false);

export const reportCardList: Writable<ReportCardListEntity[] | undefined> = writable();

export const reportCardListLoaded = writable(false);

export const documentsList: Writable<DocumentsList | undefined> = writable();

export const documentsListLoaded = writable(false);

export const messages: Writable<Message[] | undefined> = writable();

export const messagesLoaded = writable(false);

export const mail: Writable<MailData | undefined> = writable();

export const mailLoaded = writable(false);
