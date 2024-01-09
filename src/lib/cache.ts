import { get } from 'svelte/store';
import { gradebook, gradebookLoaded, studentAccount, attendance, attendanceLoaded, studentInfo } from './stores';

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
	const cache = localStorage.getItem('studentInfo');
	if (cache) studentInfo.set(JSON.parse(cache));

	const studentInfoRecord = await get(studentAccount)?.studentInfo();

	studentInfo.set(studentInfoRecord);
	localStorage.setItem('studentInfo', JSON.stringify(studentInfoRecord));
};
