import { LocalStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Gradebook } from '$lib/types/Gradebook';
import { periodOverrideState, type PeriodOverrideState } from './reportingPeriods.svelte';

export const gradebookState: { gradebook?: Gradebook; loaded: boolean } = $state({ loaded: false });

export const loadGradebook = async () => {
	if (!acc.studentAccount) return;

	gradebookState.loaded = false;

	const cache = localStorage.getItem(LocalStorageKey.gradebook);
	if (cache) {
		try {
			gradebookState.gradebook = JSON.parse(cache);
		} catch (e) {
			console.error(e);
			localStorage.removeItem(LocalStorageKey.gradebook);
		}
	}

	const override = localStorage.getItem(LocalStorageKey.periodOverrideState);
	if (override) {
		const restoredState: PeriodOverrideState = JSON.parse(override);

		periodOverrideState.new = restoredState.new;
		periodOverrideState.original = restoredState.original;

		gradebookState.gradebook = await acc.studentAccount.gradebook(periodOverrideState.new?.index);
	} else {
		gradebookState.gradebook = await acc.studentAccount.gradebook();
	}

	gradebookState.loaded = true;
};
