import { get } from 'svelte/store';
import { gradebook, gradebookLoaded, studentAccount } from './stores';

export function loadGradebook() {
	gradebookLoaded.set(false);

	const cache = localStorage.getItem('gradebook');
	if (cache) gradebook.set(JSON.parse(cache));

	get(studentAccount)
		.grades()
		.then((grades) => {
			gradebook.set(grades);
			localStorage.setItem('gradebook', JSON.stringify(grades));

			gradebookLoaded.set(true);
		});
}
