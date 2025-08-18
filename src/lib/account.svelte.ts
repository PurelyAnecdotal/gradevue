import { LocalStorageKey } from '$lib';
import { StudentAccount } from '$lib/synergy';

export const acc: { studentAccount?: StudentAccount } = $state({});

export const loadStudentAccount = () => {
	const token = localStorage.getItem(LocalStorageKey.token);
	if (token === null) return;

	const {
		username,
		password,
		domain
	}: {
		username: string;
		password: string;
		domain: string;
	} = JSON.parse(token);

	acc.studentAccount = new StudentAccount(domain, username, password);
};
