import { gradebook, gradebookLoaded, studentAccount as studentAccountStore } from '$lib/stores';
import { get } from 'svelte/store';

export interface Period {
	name: string;
	startDate: Date;
	endDate: Date;
}

export const periodState: {
	original?: {
		period: Period;
		index: number;
	};
	new?: Period;
} = $state({});

export const displayPeriodOverride: { period?: Period } = $state({});

export async function changeReportPeriod(newPeriod: Period, index: number) {
	displayPeriodOverride.period = newPeriod;

	periodState.new = undefined;

	gradebookLoaded.set(false);

	const studentAccount = get(studentAccountStore);

	if (!studentAccount) return;

	const newGradebook = await studentAccount.grades(index);

	gradebook.set(newGradebook);
	gradebookLoaded.set(true);

	if (newGradebook.ReportingPeriod._GradePeriod !== newPeriod.name) {
		console.warn(
			`Synergy returned reporting period ${newGradebook.ReportingPeriod._GradePeriod} when asked for ${newPeriod.name}`
		);

		if (newGradebook.ReportingPeriod._GradePeriod === periodState.original?.period.name) {
			periodState.new = undefined;
			periodState.original = undefined;
			displayPeriodOverride.period = undefined;

			return;
		}
	}

	periodState.new = newPeriod;
	displayPeriodOverride.period = undefined;
}
