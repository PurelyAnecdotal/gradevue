import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type';
import { acc } from './account.svelte';

export function getColorForGrade(grade: string | number) {
	if (typeof grade == 'number') {
		if (grade > 100) return 'blue';
		if (grade >= 90) return 'green';
		else if (grade >= 80) return 'yellow';
		else return 'red';
	}

	if (grade.match(/^A\+?-?$/)) return 'green';
	else if (grade.match(/^B\+?-?$/)) return 'yellow';
	else if (grade.match(/^[CDEF]\+?-?$/)) return 'red';
	return 'gray';
}

export const removeClassID = (name: string) => name.replace(/ \([A-Z]+\)( \([0-9]+\))?$/, '');

const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

export function getRelativeTime(date: Date) {
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (seconds < 60) {
		return rtf.format(-seconds, 'second');
	} else if (minutes < 60) {
		return rtf.format(-minutes, 'minute');
	} else if (hours < 24) {
		return rtf.format(-hours, 'hour');
	} else if (days < 30) {
		return rtf.format(-days, 'day');
	} else if (months < 12) {
		return rtf.format(-months, 'month');
	} else {
		return rtf.format(-years, 'year');
	}
}

export const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'short'
});

export const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'full'
});

export async function getBlobURLFromBase64String(base64: string) {
	const byteArray = new Uint8Array(Buffer.from(base64, 'base64'));

	const mimeType = (await fileTypeFromBuffer(byteArray))?.mime;

	if (!mimeType) throw new Error('Could not determine MIME type');

	const blob = new Blob([byteArray], { type: mimeType });

	return URL.createObjectURL(blob);
}

export enum LocalStorageKey {
	token = 'token',
	gradebook = 'gradebook2',
	seenAssignmentIDs = 'seenAssignmentIDs',
	attendance = 'attendance',
	documents = 'documents',
	mailData = 'mailData',
	studentInfo = 'studentInfo'
}

export interface RecordState<T> {
	data?: T;
	loaded: boolean;
	lastRefresh?: number;
}

export interface LocalStorageCache<T> {
	data: T;
	lastRefresh: number;
}

export const loadRecord = async <T>(
	recordState: RecordState<T>,
	loadFunc: () => Promise<T>,
	localStorageKey: string,
	cacheExpirationTime: number | undefined,
	forceRefresh = false
) => {
	if ((recordState.data && !forceRefresh) || !acc.studentAccount) return;

	recordState.loaded = false;

	let refresh = true;

	const cacheStr = localStorage.getItem(localStorageKey);
	if (cacheStr) {
		try {
			const cache: LocalStorageCache<T> = JSON.parse(cacheStr);

			recordState.data = cache.data;
			recordState.lastRefresh = cache.lastRefresh;

			if (cacheExpirationTime !== undefined && Date.now() - cache.lastRefresh < cacheExpirationTime)
				refresh = false;
		} catch (e) {
			console.error(e);
			localStorage.removeItem(localStorageKey);
		}
	}

	if (refresh || forceRefresh) {
		try {
			recordState.data = await loadFunc();
			recordState.lastRefresh = Date.now();

			const newCache: LocalStorageCache<T> = {
				data: recordState.data,
				lastRefresh: recordState.lastRefresh
			};

			localStorage.setItem(localStorageKey, JSON.stringify(newCache));
		} catch (err) {
			console.error(err);
		}
	}

	recordState.loaded = true;
};
