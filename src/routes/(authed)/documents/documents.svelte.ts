import { loadRecord, LocalStorageKey, type RecordState } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Documents } from '$lib/types/Documents';

export const documentsState: RecordState<Documents> = $state({ loaded: false });

export const loadDocuments = async (forceRefresh = false) => {
	const { studentAccount } = acc;
	if (!studentAccount) return;

	await loadRecord(
		documentsState,
		() => studentAccount.documents(),
		LocalStorageKey.documents,
		1000 * 60 * 60 * 24,
		forceRefresh
	);
}
