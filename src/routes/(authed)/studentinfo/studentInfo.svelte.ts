import { loadRecord, LocalStorageKey, type RecordState } from '$lib';
import { acc } from '$lib/account.svelte';
import type { StudentInfo } from '$lib/types/StudentInfo';

export const studentInfoState: RecordState<StudentInfo> = $state({ loaded: false });

export const loadStudentInfo = async (forceRefresh = false) => {
	const { studentAccount } = acc;
	if (!studentAccount) return;

	await loadRecord(
		studentInfoState,
		() => studentAccount.studentInfo(),
		LocalStorageKey.studentInfo,
		1000 * 60 * 60 * 24 * 30,
		forceRefresh
	);
};
