import { LocalStorageKey, type LocalStorageCache, type RecordState } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Gradebook, ReportPeriod } from '$lib/types/Gradebook';

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

	if (!studentAccount || gradebooksState.records || gradebooksState.activeIndex) return;

	console.log('Initializing gradebook');

	// Try to load from cache first
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

	// If the cache hasn't been initalized yet
	if (gradebooksState.activeIndex === undefined || gradebooksState.records === undefined) {
		const activeGradebook = await studentAccount.gradebook();

		const activeIndex = getPeriodIndex(
			activeGradebook.ReportingPeriod,
			activeGradebook.ReportingPeriods.ReportPeriod
		);

		gradebooksState.records ??= Array(activeGradebook.ReportingPeriods.ReportPeriod.length);

		gradebooksState.records[activeIndex] = { data: activeGradebook, loaded: true };

		gradebooksState.activeIndex = activeIndex;
	}

	if (gradebooksState.overrideIndex && !gradebooksState?.records[gradebooksState.overrideIndex]) {
		await showGradebook(gradebooksState.overrideIndex);
	}

	if (!cacheStr) saveGradebooksState();
};

export const showGradebook = async (overrideIndex?: number, forceRefresh = false) => {
	const { studentAccount } = acc;
	if (!studentAccount) return;

	console.log(overrideIndex);

	if (overrideIndex === gradebooksState.activeIndex) gradebooksState.overrideIndex = undefined;
	else if (overrideIndex !== undefined) gradebooksState.overrideIndex = overrideIndex;

	// if state is undefined, init

	if (gradebooksState.records === undefined || gradebooksState.activeIndex === undefined) {
		await loadGradebooks();

		if (gradebooksState.records === undefined || gradebooksState.activeIndex === undefined)
			throw new Error('Gradebook failed to init');
	}

	const index = overrideIndex ?? gradebooksState.activeIndex;

	console.log(`Loading gradebook ${index}`);

	// set loaded to false

	gradebooksState.records[index] ??= {
		loaded: false
	};

	if (gradebooksState.records[index].loaded !== false)
		gradebooksState.records[index].loaded = false;

	// get from cache, check if expired

	let refresh = true;

	if (Date.now() - (gradebooksState.records[index].lastRefresh ?? 0) < cacheExpirationTime) {
		gradebooksState.records[index].loaded = true;
		refresh = false;
	}

	// if expired, get real
	if (refresh || forceRefresh) {
		console.log('Refreshing gradebook');

		const newGradebook = await studentAccount.gradebook(overrideIndex);

		gradebooksState.records[index].data = newGradebook;
		gradebooksState.records[index].lastRefresh = Date.now();
		// save to cache

		saveGradebooksState();
	}

	console.log(`Gradebook ${index} finished loading`);

	// set loaded to true
	gradebooksState.records[index].loaded = true;
};
