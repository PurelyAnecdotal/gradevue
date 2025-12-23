import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type';
import { acc } from './account.svelte';

export const brand = 'GradeCompass';

export function getColorForGrade(grade: string | number) {
	if (typeof grade === 'number') {
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

	if (mimeType === undefined) throw new Error('Could not determine MIME type');

	const blob = new Blob([byteArray], { type: mimeType });

	return URL.createObjectURL(blob);
}

export enum LocalStorageKey {
	token = 'token',
	gradebook = 'gradebook3',
	seenAssignmentIDs = 'seenAssignmentIDs',
	attendance = 'attendance',
	documents = 'documents',
	mailData = 'mailData',
	studentInfo = 'studentInfo',
	dismissedRebrandAlert = 'dismissedRebrandAlert'
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
	if ((recordState.data !== undefined && !forceRefresh) || acc.studentAccount === undefined) return;

	recordState.loaded = false;

	let refresh = true;

	const cacheStr = localStorage.getItem(localStorageKey);
	if (cacheStr !== null) {
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

// https://github.com/barvian/number-flow/blob/e9fc6999417df7cb7e7b290f7f2019f570c18cc7/packages/number-flow/src/index.ts#L73
export const numberFlowDefaultEasing =
	'linear(0,.005,.019,.039,.066,.096,.129,.165,.202,.24,.278,.316,.354,.39,.426,.461,.494,.526,.557,.586,.614,.64,.665,.689,.711,.731,.751,.769,.786,.802,.817,.831,.844,.856,.867,.877,.887,.896,.904,.912,.919,.925,.931,.937,.942,.947,.951,.955,.959,.962,.965,.968,.971,.973,.976,.978,.98,.981,.983,.984,.986,.987,.988,.989,.99,.991,.992,.992,.993,.994,.994,.995,.995,.996,.996,.9963,.9967,.9969,.9972,.9975,.9977,.9979,.9981,.9982,.9984,.9985,.9987,.9988,.9989,1)';
