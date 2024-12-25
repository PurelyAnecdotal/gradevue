import { gradebook, gradebookLoaded, studentAccount as studentAccountStore } from '$lib/stores';
import { get } from 'svelte/store';

export interface Period {
	name: string;
	startDate: Date;
	endDate: Date;
}

export interface PeriodOverrideState {
	original?: {
		period: Period;
		index: number;
	};
	new?: {
		period: Period;
		index: number;
	};
}

export const periodOverrideState: PeriodOverrideState = $state({});

export async function changeReportPeriod(newPeriod: Period, index: number) {
	periodOverrideState.new = undefined;

	gradebookLoaded.set(false);

	const studentAccount = get(studentAccountStore);

	if (!studentAccount) return;

	const newGradebook = await studentAccount.gradebook(index);

	gradebook.set(newGradebook);
	gradebookLoaded.set(true);

	if (newGradebook.ReportingPeriod._GradePeriod !== newPeriod.name) {
		console.warn(
			`Synergy returned reporting period ${newGradebook.ReportingPeriod._GradePeriod} when asked for ${newPeriod.name}`
		);
	}

	if (newGradebook.ReportingPeriod._GradePeriod === periodOverrideState.original?.period.name) {
		resetPeriodOverride();
		return;
	}

	periodOverrideState.new = { period: newPeriod, index: index };

	localStorage.setItem('periodOverrideState', JSON.stringify(periodOverrideState));
}

export function resetPeriodOverride() {
	periodOverrideState.new = undefined;
	periodOverrideState.original = undefined;
	localStorage.removeItem('periodOverrideState');
}
