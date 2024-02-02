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

export function extractPoints(score: string): [number, number] {
	if (score.endsWith(' Points Possible'))
		return [NaN, parseFloat(score.replace(/ Points Possible$/, ''))];

	const [num, denom] = score.split(' / ').map(parseFloat);
	return [num, denom];
}

export function calculatePercent(score: string) {
	const points = extractPoints(score);
	if (points == null) return 0;

	let [num, denom] = points;
	if (denom == 0) return 100;

	if (isNaN(num)) num = 0;
	if (isNaN(denom)) denom = 0;
	return (num / denom) * 100;
}

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
