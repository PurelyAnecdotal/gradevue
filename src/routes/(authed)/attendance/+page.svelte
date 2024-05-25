<script lang="ts">
	import { browser } from '$app/environment';
	import { fullDateFormatter, removeClassID } from '$lib';
	import { loadAttendance } from '$lib/cache';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { attendance, attendanceLoaded } from '$lib/stores';
	import type { PeriodEntity } from '$lib/types/Attendance';
	import { Accordion, AccordionItem, Badge } from 'flowbite-svelte';

	if (!$attendance && browser) loadAttendance();

	function getAbsenceType(periods: PeriodEntity[]) {
		const reasons = periods.map((period: PeriodEntity) => period._Name);

		if (reasons.some((reason) => reason === 'Absent' || reason === 'Non ADA')) return 'Absent';

		if (reasons.some((reason) => reason.match(/Tardy/))) return 'Tardy';

		if (
			reasons.some((reason) =>
				reason.match(
					/Field Trip|School Pass|Excused|Medical\/Dent|Comp Ed\/Court-Religi|Illness or Sickness|SB14 Wellness\/Illnes/
				)
			)
		)
			return 'Excused';

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
			<AccordionItem class="dark:">
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
