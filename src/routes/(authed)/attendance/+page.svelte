<script lang="ts">
	import type { Attendance, PeriodEntity } from '$lib/Attendance';
	import { studentAccount } from '$lib/stores';
	import { Badge, Card, Accordion, AccordionItem } from 'flowbite-svelte';
	import { removeClassID } from '$lib';

	let attendance: Attendance;
	$studentAccount.attendance().then((data) => {
		attendance = data;
	});

	const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });

	function getAbsenceType(periods: PeriodEntity[]) {
		const reasons = periods.map((period: PeriodEntity) => period._Name);

		if (reasons.some((reason) => reason == 'Absent')) return 'Absent';

		if (reasons.some((reason) => reason.match(/Tardy/))) return 'Tardy';

		if (reasons.some((reason) => reason.match(/Field Trip|School Pass|Excused|Medical\/Dent/)))
			return 'Excused';

		return 'Unknown';
	}

	function getAbsenceColor(absenceType: string) {
		switch (absenceType) {
			case 'Absent':
				return 'red';
			case 'Tardy':
				return 'yellow';
			case 'Excused':
				return 'green';
			default:
				return 'primary';
		}
	}
</script>

{#if attendance}
	<Accordion class="m-4">
		{#each attendance.Absences.Absence ?? [] as absence}
			<AccordionItem class="dark:">
				<div slot="header">
					{dateFormatter.format(new Date(absence._AbsenceDate))}
					{#if getAbsenceType(absence.Periods.Period ?? [])}
						<Badge
							color={getAbsenceColor(getAbsenceType(absence.Periods.Period ?? []) ?? 'unknown')}
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
