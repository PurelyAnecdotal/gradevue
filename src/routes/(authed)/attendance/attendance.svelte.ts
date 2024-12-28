import { LocalStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Attendance } from '$lib/types/Attendance';

export const attendanceState: {
	attendance?: Attendance;
	loaded: boolean;
} = $state({ loaded: false });

export async function loadAttendance() {
	if (attendanceState.attendance || !acc.studentAccount) return;

	attendanceState.loaded = false;

	const cache = localStorage.getItem(LocalStorageKey.attendance);
	if (cache) {
		try {
			attendanceState.attendance = JSON.parse(cache);
		} catch (e) {
			console.error(e);
			localStorage.removeItem(LocalStorageKey.attendance);
		}
	}

	attendanceState.attendance = await acc.studentAccount.attendance();
	attendanceState.loaded = true;

	localStorage.setItem(LocalStorageKey.attendance, JSON.stringify(attendanceState.attendance));
}
