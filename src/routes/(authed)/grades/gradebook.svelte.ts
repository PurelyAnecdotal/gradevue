import { LocalStorageKey, type LocalStorageCache, type RecordState } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Gradebook, ReportPeriod } from '$lib/types/Gradebook';
import { SvelteSet } from 'svelte/reactivity';

interface GradebooksLocalStorageCache {
	records: (undefined | LocalStorageCache<Gradebook>)[];
	activeIndex: number;
	overrideIndex?: number;
}

interface GradebooksState {
	records?: (undefined | RecordState<Gradebook>)[];
	activeIndex?: number;
	overrideIndex?: number;
}

export const gradebooksState: GradebooksState = $state({});

export const getCurrentGradebookState = (gradebooksState: GradebooksState) =>
	gradebooksState.records && gradebooksState.activeIndex
		? gradebooksState.records[gradebooksState.overrideIndex ?? gradebooksState.activeIndex]
		: undefined;

export const seenAssignmentIDs = new SvelteSet<string>();

const cacheExpirationTime = 1000 * 60;

export const getPeriodIndex = (period: ReportPeriod, periods: ReportPeriod[]) =>
	periods.map((period) => period._GradePeriod).findIndex((name) => name === period._GradePeriod);

const saveGradebooksState = () => {
	if (!gradebooksState.records || !gradebooksState.activeIndex)
		throw new Error('Gradebook state not initialized before saving');

	const cache: GradebooksLocalStorageCache = {
		records: gradebooksState.records.map((record) => {
			if (!record || !record.data || !record.lastRefresh) return undefined;

			return { data: record.data, lastRefresh: record.lastRefresh };
		}),
		activeIndex: gradebooksState.activeIndex,
		overrideIndex: gradebooksState.overrideIndex
	};

	localStorage.setItem(LocalStorageKey.gradebook, JSON.stringify(cache));
};

export const loadGradebooks = async () => {
	const { studentAccount } = acc;
	if (!studentAccount || gradebooksState.records || gradebooksState.activeIndex !== undefined)
		return;

	// Try to load the state from the localStorage cache
	const cacheStr = localStorage.getItem(LocalStorageKey.gradebook);
	if (cacheStr) {
		try {
			const cache: GradebooksLocalStorageCache = JSON.parse(cacheStr);

			gradebooksState.records = cache.records.map((lsCache) => {
				if (!lsCache) return lsCache;

				const record: RecordState<Gradebook> = {
					data: lsCache.data,
					loaded: false,
					lastRefresh: lsCache.lastRefresh
				};

				return record;
			});
			gradebooksState.activeIndex = cache.activeIndex;
			gradebooksState.overrideIndex = cache.overrideIndex;
		} catch (err) {
			console.error(err);
			localStorage.removeItem(LocalStorageKey.gradebook);
		}
	}

	// If the state hasn't been initalized yet (e.g. if localStorage was cleared)
	if (gradebooksState.activeIndex === undefined || gradebooksState.records === undefined) {
		// Request the active gradebook to get the active index
		const activeGradebook = await studentAccount.gradebook();

		const activeIndex = getPeriodIndex(
			activeGradebook.ReportingPeriod,
			activeGradebook.ReportingPeriods.ReportPeriod
		);
		gradebooksState.activeIndex = activeIndex;

		// Initialize the records array (will be undefined at first)
		gradebooksState.records ??= Array(activeGradebook.ReportingPeriods.ReportPeriod.length);

		// Save the active gradebook to the records array
		gradebooksState.records[activeIndex] = {
			data: activeGradebook,
			loaded: true,
			lastRefresh: Date.now()
		};
	}

	// Load the gradebook currently being viewed
	await showGradebook(gradebooksState.overrideIndex);

	// Save the state to localStorage
	saveGradebooksState();

	// Load seen assignment ids from localStorage
	const seenIDsStr = localStorage.getItem(LocalStorageKey.seenAssignmentIDs);
	if (seenIDsStr) {
		try {
			const seenIDs: string[] = JSON.parse(seenIDsStr);
			seenIDs.forEach((id) => seenAssignmentIDs.add(id));
		} catch (e) {
			console.error(e);
			localStorage.removeItem(LocalStorageKey.seenAssignmentIDs);
		}
	}
};

export const showGradebook = async (overrideIndex?: number, forceRefresh = false) => {
	const { studentAccount } = acc;
	if (!studentAccount) return;

	if (gradebooksState.records === undefined || gradebooksState.activeIndex === undefined)
		throw new Error('Gradebooks state is not initialized');

	// If the override index is the same as the active index, override isn't needed
	if (overrideIndex === gradebooksState.activeIndex) gradebooksState.overrideIndex = undefined;
	else gradebooksState.overrideIndex = overrideIndex;

	const index = overrideIndex ?? gradebooksState.activeIndex;

	// Set the state of the requested gradebook to loading in preparation for possible cache refresh
	gradebooksState.records[index] ??= { loaded: false };

	if (gradebooksState.records[index].loaded) gradebooksState.records[index].loaded = false;

	// Check if cache is expired
	let refresh = true;
	if (
		!forceRefresh &&
		Date.now() - (gradebooksState.records[index].lastRefresh ?? 0) < cacheExpirationTime
	) {
		gradebooksState.records[index].loaded = true;
		refresh = false;
	}

	// If expired or refreshing manually, refresh
	if (refresh) {
		try {
			const newGradebook = await studentAccount.gradebook(overrideIndex);

			gradebooksState.records[index].data = newGradebook;
			gradebooksState.records[index].lastRefresh = Date.now();

			// If it retrieved the active gradebook
			if (overrideIndex === undefined) {
				// Check if the active index has changed since the last time it was set
				const newIndex = getPeriodIndex(
					newGradebook.ReportingPeriod,
					newGradebook.ReportingPeriods.ReportPeriod
				);

				// If it has, update the active index
				if (newIndex !== index) gradebooksState.activeIndex = newIndex;
			}
		} catch (err) {
			console.error(err);
		}
	}

	gradebooksState.records[index].loaded = true;

	saveGradebooksState();
};

export const saveSeenAssignments = () =>
	localStorage.setItem(LocalStorageKey.seenAssignmentIDs, JSON.stringify([...seenAssignmentIDs]));
