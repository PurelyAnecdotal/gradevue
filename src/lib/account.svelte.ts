import { LocalStorageKey } from '$lib/constants';
import { DEFAULT_SYFETCH_URL } from '$lib/syfetch';
import { StudentAccount } from '$lib/synergy';

export const acc: { studentAccount?: StudentAccount } = $state({});

export const loadStudentAccount = () => {
	const token = localStorage.getItem(LocalStorageKey.token);
	if (token === null) return;

	const {
		username,
		password,
		domain,
		syfetchUrl
	}: {
		username: string;
		password: string;
		domain: string;
		syfetchUrl?: string;
	} = JSON.parse(token);

	const activeSyfetchUrl =
		syfetchUrl || localStorage.getItem(LocalStorageKey.syfetchUrl) || DEFAULT_SYFETCH_URL;

	acc.studentAccount = new StudentAccount(domain, username, password, activeSyfetchUrl);
};
