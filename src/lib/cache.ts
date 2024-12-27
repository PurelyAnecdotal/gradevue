import { localStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import {
	gradebook,
	gradebookLoaded,
} from '$lib/stores';
import type { Writable } from 'svelte/store';
import {
	periodOverrideState,
	type PeriodOverrideState
} from '../routes/(authed)/grades/reportingPeriods.svelte';

const writeCacheToStore = (key: string, store: Writable<unknown>) => {
	const cache = localStorage.getItem(key);
	if (cache) {
		try {
			store.set(JSON.parse(cache));
		} catch (e) {
			console.error(e);
			localStorage.removeItem(key);
		}
	}
};

export const loadGradebook = async () => {
	if (!acc.studentAccount) return;

	gradebookLoaded.set(false);

	writeCacheToStore('gradebook', gradebook);

	const override = localStorage.getItem(localStorageKey.periodOverrideState);

	if (override) {
		const restoredState: PeriodOverrideState = JSON.parse(override);

		periodOverrideState.new = restoredState.new;
		periodOverrideState.original = restoredState.original;

		const grades = await acc.studentAccount.gradebook(periodOverrideState.new?.index);

		gradebook.set(grades);

		gradebookLoaded.set(true);

		return;
	}

	const grades = await acc.studentAccount.gradebook();

	gradebook.set(grades);
	localStorage.setItem(localStorageKey.gradebook, JSON.stringify(grades));

	gradebookLoaded.set(true);
};
