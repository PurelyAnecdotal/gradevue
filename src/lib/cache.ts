import { get } from 'svelte/store';
import { gradebook, gradebookLoaded, studentAccount, attendance, attendanceLoaded } from './stores';

export function loadGradebook() {
	gradebookLoaded.set(false);

	const cache = localStorage.getItem('gradebook');
	if (cache) gradebook.set(JSON.parse(cache));

	get(studentAccount)
		?.grades()
		.then((grades) => {
			gradebook.set(grades);
			localStorage.setItem('gradebook', JSON.stringify(grades));

			gradebookLoaded.set(true);
		});
}

export function loadAttendance() {
	attendanceLoaded.set(false);

	const cache = localStorage.getItem('attendance');
	if (cache) attendance.set(JSON.parse(cache))

	get(studentAccount)
		?.attendance()
		.then((attendanceRecord) => {
			attendance.set(attendanceRecord);
			localStorage.setItem('attendance', JSON.stringify(attendanceRecord));

			attendanceLoaded.set(true);
		});
}