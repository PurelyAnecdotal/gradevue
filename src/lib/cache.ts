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

export const loadAttendance = async () => {
	attendanceLoaded.set(false);

	writeCacheToStore('attendance', attendance);

	const attendanceRecord = await get(studentAccount)?.attendance();

	attendance.set(attendanceRecord);
	localStorage.setItem('attendance', JSON.stringify(attendanceRecord));

	attendanceLoaded.set(true);
};

export const loadStudentInfo = async () => {
	studentInfoLoaded.set(false);

	writeCacheToStore('studentInfo', studentInfo);

	const studentInfoRecord = await get(studentAccount)?.studentInfo();

	studentInfo.set(studentInfoRecord);
	localStorage.setItem('studentInfo', JSON.stringify(studentInfoRecord));

	studentInfoLoaded.set(true);
};

export const loadDocuments = async () => {
	documentsLoaded.set(false);

	writeCacheToStore('documents', documents);

	const documentsRecord = await get(studentAccount)?.documents();

	documents.set(documentsRecord);
	localStorage.setItem('documents', JSON.stringify(documentsRecord));

	documentsLoaded.set(true);
};

export const loadMailData = async () => {
	mailDataLoaded.set(false);

	writeCacheToStore('mailData', mailData);

	const mailDataRecord = await get(studentAccount)?.mailData();

	mailData.set(mailDataRecord);
	localStorage.setItem('mailData', JSON.stringify(mailDataRecord));

	mailDataLoaded.set(true);
};
