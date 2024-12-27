import { LocalStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import { gradebookState } from './gradebook.svelte';

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

	gradebookState.loaded = false;

	const newGradebook = await acc.studentAccount.gradebook(index);

	gradebookState.gradebook = newGradebook;
	gradebookState.loaded = true;

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

	localStorage.setItem(LocalStorageKey.periodOverrideState, JSON.stringify(periodOverrideState));
}

export function resetPeriodOverride() {
	periodOverrideState.new = undefined;
	periodOverrideState.original = undefined;
	localStorage.removeItem(LocalStorageKey.periodOverrideState);
}
