import { get, type Writable } from 'svelte/store';
import {
	attendance,
	attendanceLoaded,
	documentsList,
	documentsListLoaded,
	gradebook,
	gradebookLoaded,
	messages,
	messagesLoaded,
	reportCardList,
	reportCardListLoaded,
	studentAccount,
	studentInfo,
	studentInfoLoaded
} from './stores';

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
}

export const loadGradebook = async () => {
	gradebookLoaded.set(false);

	writeCacheToStore('gradebook', gradebook);

	const grades = await get(studentAccount)?.grades();

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

export const loadReportCardList = async () => {
	reportCardListLoaded.set(false);

	writeCacheToStore('reportCardList', reportCardList);

	const reportCardListRecord = await get(studentAccount)?.reportCardList();

	reportCardList.set(reportCardListRecord);
	localStorage.setItem('reportCardList', JSON.stringify(reportCardListRecord));

	reportCardListLoaded.set(true);
};

export const loadDocumentsList = async () => {
	documentsListLoaded.set(false);

	writeCacheToStore('documentsList', documentsList);

	const documentsListRecord = await get(studentAccount)?.documentsList();

	documentsList.set(documentsListRecord);
	localStorage.setItem('documentsList', JSON.stringify(documentsListRecord));

	documentsListLoaded.set(true);
};

export const loadMessages = async () => {
	messagesLoaded.set(false);

	writeCacheToStore('messages', messages);

	const messagesRecord = await get(studentAccount)?.messages();

	messages.set(messagesRecord);
	localStorage.setItem('messages', JSON.stringify(messagesRecord));

	messagesLoaded.set(true);
};
