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
