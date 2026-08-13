import { LocalStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import { Operation, parseGradebookXML, unwrapEnvelope } from '$lib/synergy';
import type { Gradebook, ReportPeriod } from '$lib/types/Gradebook';

export interface GradebookRecord {
	xml?: string;
	gradebook?: Gradebook;
	lastRefresh: number;
}

interface GradebookCatalogLocalStorageCache {
	recordCache: (null | GradebookRecord)[];
	defaultIndex: number;
	overrideIndex: number | null;
}

export interface GradebookCatalog {
	recordCache: (undefined | GradebookRecord)[];
	defaultIndex: number;
	overrideIndex?: number;
	loadingIndex?: number;
	receivingData?: boolean;
	canonicalReportPeriodEntries?: ReportPeriod[];
}

export function parseGradebookRecord(record: GradebookRecord): Gradebook {
	if (record.gradebook !== undefined) return record.gradebook;
	if (record.xml !== undefined && record.xml.length > 0) return parseGradebookXML(record.xml);
	throw new Error('Gradebook record is empty');
}

export function getGradebookCatalogFromLocalStorage() {
	const cacheStr = localStorage.getItem(LocalStorageKey.gradebook);
	if (cacheStr === null) return undefined;

	const cache = JSON.parse(cacheStr) as GradebookCatalogLocalStorageCache;

	const defaultRecord = cache.recordCache[cache.defaultIndex];

	const canonicalReportPeriodEntries = defaultRecord
		? parseGradebookRecord(defaultRecord).ReportingPeriods.ReportPeriod
		: undefined;

	const gradebookCatalog: GradebookCatalog = {
		recordCache: cache.recordCache.map((record) => record ?? undefined),
		defaultIndex: cache.defaultIndex,
		overrideIndex: cache.overrideIndex ?? undefined,
		canonicalReportPeriodEntries
	};
	return gradebookCatalog;
}

export function saveGradebookCatalogToLocalStorage(gradebookCatalog: GradebookCatalog) {
	const cache: GradebookCatalogLocalStorageCache = {
		recordCache: gradebookCatalog.recordCache.map((record) => record ?? null),
		defaultIndex: gradebookCatalog.defaultIndex,
		overrideIndex: gradebookCatalog.overrideIndex ?? null
	};

	localStorage.setItem(LocalStorageKey.gradebook, JSON.stringify(cache));
}

export async function getGradebookRecord(onReceivingData?: () => void, reportPeriod?: number) {
	const { studentAccount } = acc;
	if (!studentAccount) throw new Error('Cannot get gradebook: student account not loaded');

	if (studentAccount.mode === 'pxp2') {
		onReceivingData?.();
		const gradebook = await studentAccount.fetchPxp2Gradebook(reportPeriod);
		const record: GradebookRecord = {
			gradebook,
			lastRefresh: Date.now()
		};
		return record;
	}

	const res = await studentAccount.gradebookRequest(reportPeriod);

	onReceivingData?.();

	const envelopeStr = await res.text();

	const record: GradebookRecord = {
		xml: unwrapEnvelope(envelopeStr, Operation.Request),
		lastRefresh: Date.now()
	};
	return record;
}

export async function getInitialGradebookCatalog() {
	const defaultGradebookRecord = await getGradebookRecord();

	const defaultGradebook = parseGradebookRecord(defaultGradebookRecord);

	const canonicalReportPeriodEntries = defaultGradebook.ReportingPeriods.ReportPeriod;

	const reportingPeriods: (undefined | GradebookRecord)[] = Array.from({
		length: canonicalReportPeriodEntries.length
	});

	const defaultIndex = parseInt(defaultGradebook.ReportingPeriod._Index);

	reportingPeriods[defaultIndex] = defaultGradebookRecord;

	const gradebookCatalog: GradebookCatalog = {
		recordCache: reportingPeriods,
		defaultIndex,
		canonicalReportPeriodEntries
	};
	return gradebookCatalog;
}

const cacheExpirationTime = 1000 * 60 * 5;

export const gradebookRefreshNeeded = (record: GradebookRecord) =>
	Date.now() - record.lastRefresh > cacheExpirationTime;
