import { get } from 'svelte/store';
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

export const loadGradebook = async () => {
	gradebookLoaded.set(false);

	const cache = localStorage.getItem('gradebook');
	if (cache) {
		try {
			gradebook.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem('gradebook');
		}
	}
	const grades = await get(studentAccount)?.grades();

	gradebook.set(grades);
	localStorage.setItem('gradebook', JSON.stringify(grades));

	gradebookLoaded.set(true);
};

export const loadAttendance = async () => {
	attendanceLoaded.set(false);

	const cache = localStorage.getItem('attendance');
	if (cache) {
		try {
			attendance.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem('attendance');
		}
	}

	const attendanceRecord = await get(studentAccount)?.attendance();

	attendance.set(attendanceRecord);
	localStorage.setItem('attendance', JSON.stringify(attendanceRecord));

	attendanceLoaded.set(true);
};

export const loadStudentInfo = async () => {
	studentInfoLoaded.set(false);

	const cache = localStorage.getItem('studentInfo');
	if (cache) {
		try {
			studentInfo.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem('studentInfo');
		}
	}

	const studentInfoRecord = await get(studentAccount)?.studentInfo();

	studentInfo.set(studentInfoRecord);
	localStorage.setItem('studentInfo', JSON.stringify(studentInfoRecord));

	studentInfoLoaded.set(true);
};

export const loadReportCardList = async () => {
	reportCardListLoaded.set(false);

	const cache = localStorage.getItem('reportCardList');
	if (cache) {
		try {
			reportCardList.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem('reportCardList');
		}
	}

	const reportCardListRecord = await get(studentAccount)?.reportCardList();

	reportCardList.set(reportCardListRecord);
	localStorage.setItem('reportCardList', JSON.stringify(reportCardListRecord));

	reportCardListLoaded.set(true);
};

export const loadDocumentsList = async () => {
	documentsListLoaded.set(false);

	const cache = localStorage.getItem('documentsList');
	if (cache) {
		try {
			documentsList.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem('documentsList');
		}
	}

	const documentsListRecord = await get(studentAccount)?.documentsList();

	documentsList.set(documentsListRecord);
	localStorage.setItem('documentsList', JSON.stringify(documentsListRecord));

	documentsListLoaded.set(true);
};

export const loadMessages = async () => {
	messagesLoaded.set(false);

	const cache = localStorage.getItem('messages');
	if (cache) {
		try {
			messages.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem('messages');
		}
	}

	const messagesRecord = await get(studentAccount)?.messages();

	messages.set(messagesRecord);
	localStorage.setItem('messages', JSON.stringify(messagesRecord));

	messagesLoaded.set(true);
};
