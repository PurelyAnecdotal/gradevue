import { LocalStorageKey } from '$lib';
import { StudentAccount } from '$lib/synergy';

export const acc: { studentAccount?: StudentAccount } = $state({});

interface StoredToken {
	username?: string;
	password?: string;
	domain: string;
	mode?: 'soap' | 'pxp2';
}

export const loadStudentAccount = () => {
	const token = localStorage.getItem(LocalStorageKey.token);
	if (token === null) return;

	const parsed: StoredToken = JSON.parse(token);

	if (parsed.mode === 'pxp2') {
		acc.studentAccount = StudentAccount.fromPxp2(parsed.domain);
		return;
	}

	acc.studentAccount = new StudentAccount(
		parsed.domain,
		parsed.username ?? '',
		parsed.password ?? ''
	);
};
