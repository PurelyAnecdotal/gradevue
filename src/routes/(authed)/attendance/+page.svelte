<script lang="ts">
	import type { Attendance } from '$lib/Attendance';
	import { studentAccount } from '$lib/stores';

	let attendance: Attendance;
	$studentAccount.attendance().then((data) => {
		attendance = data;
	});
</script>

{#if attendance}
	<ol>
		{#each attendance.Absences.Absence ?? [] as absence}
			<li>
				{absence._AbsenceDate}:
				<ol>
					{#each absence.Periods.Period?.filter((course) => course._Name) ?? [] as period}
						<li>{period._Course}: {period._Name}</li>
					{/each}
				</ol>
			</li>
		{/each}
	</ol>
{/if}
