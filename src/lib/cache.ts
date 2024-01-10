import { get } from 'svelte/store';
import {
	studentAccount,
	gradebook,
	gradebookLoaded,
	attendance,
	attendanceLoaded,
	studentInfo,
	studentInfoLoaded,
	reportCardList,
	reportCardListLoaded,
	documentsList,
	documentsListLoaded
} from './stores';

export const loadGradebook = async () => {
	gradebookLoaded.set(false);

	const cache = localStorage.getItem('gradebook');
	if (cache) gradebook.set(JSON.parse(cache));

	const grades = await get(studentAccount)?.grades();

	gradebook.set(grades);
	localStorage.setItem('gradebook', JSON.stringify(grades));

	gradebookLoaded.set(true);
};

export const loadAttendance = async () => {
	attendanceLoaded.set(false);

	const cache = localStorage.getItem('attendance');
	if (cache) attendance.set(JSON.parse(cache));

	const attendanceRecord = await get(studentAccount)?.attendance();

	attendance.set(attendanceRecord);
	localStorage.setItem('attendance', JSON.stringify(attendanceRecord));

	attendanceLoaded.set(true);
};

export const loadStudentInfo = async () => {
	studentInfoLoaded.set(false);

	const cache = localStorage.getItem('studentInfo');
	if (cache) studentInfo.set(JSON.parse(cache));

	const studentInfoRecord = await get(studentAccount)?.studentInfo();

	studentInfo.set(studentInfoRecord);
	localStorage.setItem('studentInfo', JSON.stringify(studentInfoRecord));

	studentInfoLoaded.set(true);
};

export const loadReportCardList = async () => {
	reportCardListLoaded.set(false);

	const cache = localStorage.getItem('reportCardList');
	if (cache) reportCardList.set(JSON.parse(cache));

	const reportCardListRecord = await get(studentAccount)?.reportCardList();

	reportCardList.set(reportCardListRecord);
	localStorage.setItem('reportCardList', JSON.stringify(reportCardListRecord));

	reportCardListLoaded.set(true);
};

export const loadDocumentsList = async () => {
	documentsListLoaded.set(false);

	const cache = localStorage.getItem('documentsList');
	if (cache) documentsList.set(JSON.parse(cache));

	const documentsListRecord = await get(studentAccount)?.documentsList();

	documentsList.set(documentsListRecord);
	localStorage.setItem('documentsList', JSON.stringify(documentsListRecord));

	documentsListLoaded.set(true);
}