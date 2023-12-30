<script lang="ts">
	import type { Attendance, PeriodEntity } from '$lib/Attendance';
	import { studentAccount } from '$lib/stores';
	import { Badge, Card } from 'flowbite-svelte';
	import { removeClassID } from '$lib';

	let attendance: Attendance;
	$studentAccount.attendance().then((data) => {
		attendance = data;
	});

	const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });

	function getAbsenceType(periods: PeriodEntity[]) {
		const types = periods
			.map((period: PeriodEntity) => period._Name)
			.map((reason: string) => {
				if (reason == 'Absent') return 'Absent';
				if (reason.match(/Tardy/)) return 'Tardy';
				if (reason.match(/Field Trip|School Pass|Excused|Medical\/Dent/)) return 'Excused';
				return 'unknown';
			});
		if (types.includes('Absent')) return 'Absent';
		if (types.includes('Tardy')) return 'Tardy'
		if (types.includes('Excused')) return 'Excused';
		return 'Unknown';
	}

	function getAbsenceColor(absenceType: string) {
		switch (absenceType) {
			case 'Absent':
				return 'red';
			case 'Tardy':
				return 'yellow'
			case 'Excused':
				return 'green';
			default:
				return 'primary';
		}
	}
</script>

{#if attendance}
	<ol>
		{#each attendance.Absences.Absence ?? [] as absence}
			<li class="m-4">
				<Card padding="md" class="dark:text-white max-w-none">
					<div>
						{dateFormatter.format(new Date(absence._AbsenceDate))}
						{#if getAbsenceType(absence.Periods.Period ?? [])}
							<Badge color={getAbsenceColor(getAbsenceType(absence.Periods.Period ?? []) ?? 'unknown')}>
								{getAbsenceType(absence.Periods.Period ?? [])}
							</Badge>
						{/if}
					</div>
					<ol>
						{#each absence.Periods.Period?.filter((course) => course._Name) ?? [] as period}
							<li>{removeClassID(period._Course)}: {period._Name}</li>
						{/each}
					</ol>
				</Card>
			</li>
		{/each}
	</ol>
{/if}
