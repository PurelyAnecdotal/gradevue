import { loadRecord, LocalStorageKey, type RecordState } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Attendance } from '$lib/types/Attendance';

export const attendanceState: RecordState<Attendance> = $state({ loaded: false });

export const loadAttendance = async (forceRefresh = false) => {
	const { studentAccount } = acc;
	if (!studentAccount) return;

	await loadRecord(
		attendanceState,
		() => studentAccount.attendance(),
		LocalStorageKey.attendance,
		1000 * 60 * 60,
		forceRefresh
	);
};
