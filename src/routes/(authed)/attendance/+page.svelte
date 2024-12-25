<script lang="ts">
	import { browser } from '$app/environment';
	import { fullDateFormatter, removeClassID } from '$lib';
	import { loadAttendance } from '$lib/cache';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { attendance, attendanceLoaded } from '$lib/stores';
	import type { Period } from '$lib/types/Attendance';
	import { Accordion, AccordionItem, Badge } from 'flowbite-svelte';

	if (!$attendance && browser) loadAttendance();

	const excusedReasonRegex =
		/Field Trip|School Pass|Excused|Medical\/Dent|Comp Ed\/Court-Religi|Illness or Sickness|SB14 Wellness\/Illnes/;

	function getAbsenceType(periods: Period[]) {
		const reasons = periods.map((period: Period) => period._Name);

		if (reasons.some((reason) => reason === 'Absent' || reason === 'Non ADA')) return 'Absent';

		if (reasons.some((reason) => /Tardy/.test(reason))) return 'Tardy';

		if (reasons.some((reason) => excusedReasonRegex.test(reason))) return 'Excused';

		if (reasons.some((reason) => reason === 'Present')) return 'Present';

		return 'Unknown';
	}

	function getAbsenceColor(absenceType: string) {
		switch (absenceType) {
			case 'Absent':
				return 'red';
			case 'Tardy':
				return 'yellow';
			case 'Excused':
			case 'Present':
				return 'green';
			default:
				return 'primary';
		}
	}
</script>

<svelte:head>
	<title>Attendance - GradeVue</title>
</svelte:head>

<LoadingBanner show={!$attendanceLoaded} loadingMsg="Loading attendance..." />

{#if $attendance}
	<Accordion class="p-4">
		{#each $attendance.Absences.Absence ?? [] as absence}
			<AccordionItem>
				<div slot="header">
					{fullDateFormatter.format(new Date(absence._AbsenceDate))}
					{#if getAbsenceType(absence.Periods.Period ?? [])}
						<Badge
							color={getAbsenceColor(getAbsenceType(absence.Periods.Period ?? []) ?? 'unknown')}
							large
						>
							{getAbsenceType(absence.Periods.Period ?? [])}
						</Badge>
					{/if}
				</div>
				<ol>
					{#each absence.Periods.Period?.filter((course) => course._Name) ?? [] as period}
						<li>{removeClassID(period._Course)}: {period._Name}</li>
					{/each}
				</ol>
			</AccordionItem>
		{/each}
	</Accordion>
{/if}
