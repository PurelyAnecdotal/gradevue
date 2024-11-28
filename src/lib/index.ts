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

export function extractPoints(score: string): {
	pointsEarned: number | undefined;
	pointsPossible: number;
} {
	if (score.endsWith(' Points Possible'))
		return {
			pointsEarned: undefined,
			pointsPossible: parseFloat(score.replace(/ Points Possible$/, ''))
		};

	// Ungraded assignments
	if (score.startsWith('/ '))
		return {
			pointsEarned: undefined,
			pointsPossible: parseFloat(score.replace('/ ', ''))
		};

	// Some extra credit assignments
	if (score.endsWith(' /'))
		return {
			pointsEarned: parseFloat(score.replace(' /', '')),
			pointsPossible: 0
		};

	if (!/^\d+(\.\d+)? \/ \d+(\.\d+)?$/.test(score))
		console.warn('Score does not match expected format:', score);

	const [pointsEarned, pointsPossible] = score.split(' / ').map(parseFloat);

	if (isNaN(pointsEarned)) console.error('Points earned is NaN for score:', score);
	if (isNaN(pointsPossible)) console.error('Points possible is NaN for score:', score);

	return { pointsEarned, pointsPossible };
}

export function calculatePercent(score: string) {
	let { pointsEarned, pointsPossible } = extractPoints(score);

	if (pointsEarned === undefined) return 0;

	if (pointsPossible == 0) return 100;

	if (isNaN(pointsEarned)) pointsEarned = 0;
	if (isNaN(pointsPossible)) pointsPossible = 0;
	return (pointsEarned / pointsPossible) * 100;
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
