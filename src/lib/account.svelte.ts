import { localStorageKey } from '$lib';
import { StudentAccount } from '$lib/synergy';

export const acc: { studentAccount?: StudentAccount } = $state({});

export const loadStudentAccount = () => {
	const token = localStorage.getItem(localStorageKey.token);

	if (!token) return;

	const { username, password, domain } = JSON.parse(token);

	acc.studentAccount = new StudentAccount(domain, username, password);
};
