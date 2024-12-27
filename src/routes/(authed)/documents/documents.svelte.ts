import { localStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Documents } from '$lib/types/Documents';

export const documentsState: { documents?: Documents; loaded: boolean } = $state({ loaded: false });

export async function loadDocuments() {
	if (documentsState.documents || !acc.studentAccount) return;

	documentsState.loaded = false;

	const cache = localStorage.getItem(localStorageKey.documents);
	if (cache) {
		try {
			documentsState.documents = JSON.parse(cache);
		} catch (e) {
			console.error(e);
			localStorage.removeItem(localStorageKey.documents);
		}
	}

	documentsState.documents = await acc.studentAccount.documents();
	documentsState.loaded = true;

	localStorage.setItem(localStorageKey.documents, JSON.stringify(documentsState.documents));
}
