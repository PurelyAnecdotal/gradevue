<script lang="ts">
	import Assignment from './Assignment.svelte';

	export let assignments: {
		name: string;
		id: string;
		pointsEarned: number;
		pointsPossible: number;
		gradePercentageChange: number;
		notForGrade: boolean;
		hidden: boolean;
		hypothetical: boolean;
		category?: string;
		date?: Date;
	}[];
	export let editable = false;
	export let categoryDropdownOptions: string[] = [];
	export let recalculateGradePercentages: () => void;
</script>

<ol class="space-y-4">
	{#each assignments as { name, pointsEarned, pointsPossible, gradePercentageChange, notForGrade, hidden, hypothetical, category, date }}
		<li>
			<Assignment
				bind:name
				bind:pointsEarned
				bind:pointsPossible
				{gradePercentageChange}
				bind:notForGrade
				{hidden}
				{hypothetical}
				bind:category
				{categoryDropdownOptions}
				{date}
				{editable}
				recalculateGradePercentage={recalculateGradePercentages}
			/>
		</li>
	{/each}
</ol>
