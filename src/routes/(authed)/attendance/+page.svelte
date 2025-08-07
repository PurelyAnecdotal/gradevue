<script lang="ts">
	import { fullDateFormatter, removeClassID } from '$lib';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import type { Period } from '$lib/types/Attendance';
	import { Accordion, AccordionItem, Badge } from 'flowbite-svelte';
	import { attendanceState, loadAttendance } from './attendance.svelte';

	loadAttendance();

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

<LoadingBanner show={!attendanceState.loaded} loadingMsg="Loading attendance..." />

{#if attendanceState.lastRefresh !== undefined}
	<RefreshIndicator
		loaded={attendanceState.loaded}
		lastRefresh={attendanceState.lastRefresh}
		refresh={() => loadAttendance(true)}
	/>
{/if}

{#if attendanceState.data}
	<Accordion class="mx-4">
		{#each attendanceState.data.Absences.Absence ?? [] as absence (absence._AbsenceDate)}
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
					{#each absence.Periods.Period?.filter((course) => course._Name) ?? [] as period (period._Course)}
						<li>{removeClassID(period._Course)}: {period._Name}</li>
					{/each}
				</ol>
			</AccordionItem>
		{/each}
	</Accordion>
{/if}
