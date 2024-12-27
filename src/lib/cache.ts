import {
	attendance,
	attendanceLoaded,
	documents,
	documentsLoaded,
	gradebook,
	gradebookLoaded,
	mailData,
	mailDataLoaded,
	studentAccount,
	studentInfo,
	studentInfoLoaded
} from '$lib/stores';
import { get, type Writable } from 'svelte/store';
import {
	periodOverrideState,
	type PeriodOverrideState
} from '../routes/(authed)/grades/reportingPeriods.svelte';

const writeCacheToStore = (key: string, store: Writable<unknown>) => {
	const cache = localStorage.getItem(key);
	if (cache) {
		try {
			store.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem(key);
		}
	}
};

export const loadGradebook = async () => {
	gradebookLoaded.set(false);

	writeCacheToStore('gradebook', gradebook);

	const override = localStorage.getItem('periodOverrideState');

	if (override) {
		const restoredState: PeriodOverrideState = JSON.parse(override);

		periodOverrideState.new = restoredState.new;
		periodOverrideState.original = restoredState.original;

		const grades = await get(studentAccount)?.gradebook(periodOverrideState.new?.index);

		gradebook.set(grades);

		gradebookLoaded.set(true);

		return;
	}

	const grades = await get(studentAccount)?.gradebook();

	gradebook.set(grades);
	localStorage.setItem('gradebook', JSON.stringify(grades));

	gradebookLoaded.set(true);
};

const loadUsingCache = async <T>(key: string, store: Writable<T>, indicator: Writable<boolean>, retrievalFunc: () => Promise<T>) => {
	indicator.set(false);

	writeCacheToStore(key, store);

	const record = await retrievalFunc();

	store.set(record);
	localStorage.setItem(key, JSON.stringify(record));

	indicator.set(true);
}

export const loadAttendance = async () => {
	const acc = get(studentAccount);
	if (!acc) return;

	loadUsingCache('attendance', attendance, attendanceLoaded, acc.attendance.bind(acc));
};

export const loadStudentInfo = async () => {
	const acc = get(studentAccount);
	if (!acc) return;

	loadUsingCache('studentInfo', studentInfo, studentInfoLoaded, acc.studentInfo.bind(acc));
};

export const loadDocuments = async () => {
	const acc = get(studentAccount);
	if (!acc) return;

	loadUsingCache('documents', documents, documentsLoaded, acc.documents.bind(acc));
};

export const loadMailData = async () => {
	const acc = get(studentAccount);
	if (!acc) return;

	loadUsingCache('mailData', mailData, mailDataLoaded, acc.mailData.bind(acc));
};
