import { localStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import { gradebook, gradebookLoaded } from '$lib/stores';

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
	if (!acc.studentAccount) return;

	periodOverrideState.new = undefined;

	gradebookLoaded.set(false);

	const newGradebook = await acc.studentAccount.gradebook(index);

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

	localStorage.setItem(localStorageKey.periodOverrideState, JSON.stringify(periodOverrideState));
}

export function resetPeriodOverride() {
	periodOverrideState.new = undefined;
	periodOverrideState.original = undefined;
	localStorage.removeItem(localStorageKey.periodOverrideState);
}
