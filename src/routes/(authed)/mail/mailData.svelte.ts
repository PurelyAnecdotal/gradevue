import { LocalStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import type { MailData } from '$lib/types/MailData';

export const mailDataState: {
	mailData?: MailData;
	loaded: boolean;
} = $state({ loaded: false });

export async function loadMailData() {
	if (mailDataState.mailData || !acc.studentAccount) return;

	mailDataState.loaded = false;

	const cache = localStorage.getItem(LocalStorageKey.mailData);
	if (cache) {
		try {
			mailDataState.mailData = JSON.parse(cache);
		} catch (e) {
			console.error(e);
			localStorage.removeItem(LocalStorageKey.mailData);
		}
	}

	mailDataState.mailData = await acc.studentAccount.mailData();
	mailDataState.loaded = true;

	localStorage.setItem(LocalStorageKey.mailData, JSON.stringify(mailDataState.mailData));
}
