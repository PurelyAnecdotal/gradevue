import { loadRecord, LocalStorageKey, type RecordState } from '$lib';
import { acc } from '$lib/account.svelte';
import type { MailData } from '$lib/types/MailData';

export const mailDataState: RecordState<MailData> = $state({ loaded: false });

export const loadMailData = async (forceRefresh = false) => {
	const { studentAccount } = acc;
	if (!studentAccount) return;

	await loadRecord(
		mailDataState,
		() => studentAccount.mailData(),
		LocalStorageKey.mailData,
		1000 * 60 * 60,
		forceRefresh
	);
}