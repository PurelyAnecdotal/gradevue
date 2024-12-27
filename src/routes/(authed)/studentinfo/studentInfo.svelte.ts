import { localStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import type { StudentInfo } from '$lib/types/StudentInfo';

export const studentInfoState: {
	studentInfo?: StudentInfo;
	loaded: boolean;
} = $state({ loaded: false });

export async function loadStudentInfo() {
	if (studentInfoState.studentInfo || !acc.studentAccount) return;

	studentInfoState.loaded = false;

	const cache = localStorage.getItem(localStorageKey.studentInfo);
	if (cache) {
		try {
			studentInfoState.studentInfo = JSON.parse(cache);
		} catch (e) {
			console.error(e);
			localStorage.removeItem(localStorageKey.studentInfo);
		}
	}

	studentInfoState.studentInfo = await acc.studentAccount.studentInfo();
	studentInfoState.loaded = true;

	localStorage.setItem(localStorageKey.studentInfo, JSON.stringify(studentInfoState.studentInfo));
}
