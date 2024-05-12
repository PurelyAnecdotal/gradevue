<script lang="ts">
	import { extractPoints } from '$lib';
	import { fade } from 'svelte/transition';
	import Assignment from './Assignment.svelte';
	import type { AssignmentEntity } from './Gradebook';
	import { hypotheticalGradebook } from './stores';

	export let assignments: AssignmentEntity[];
	export let gradePercentageChangesByAssignment: { [id: string]: number };
	export let showCategories = true;
	export let hiddenPointsByCategory: { [categoryName: string]: {pointsEarned: number, pointsPossible: number} } = {};
	export let hypotheticalMode = false;
	export let hypotheticalCategoryOptions: string[] = [];
	export let recalculateGradePercentages: () => void;
</script>

<ol class="space-y-4">
	<!-- Hypothetical assignments -->
	{#if hypotheticalMode}
		{#each Object.keys($hypotheticalGradebook).filter((x) => x.startsWith('hypothetical-')) as id}
			<li transition:fade>
				<Assignment
					name={$hypotheticalGradebook[id].name ?? 'Hypothetical Assignment'}
					pointsEarned={$hypotheticalGradebook[id].pointsEarned}
					pointsPossible={$hypotheticalGradebook[id].pointsPossible}
					gradePercentageChange={gradePercentageChangesByAssignment[id]}
					{id}
					category={$hypotheticalGradebook[id].category}
					{hypotheticalMode}
					hypothetical
					{hypotheticalCategoryOptions}
					recalculateGradePercentage={recalculateGradePercentages}
				/>
			</li>
		{/each}
	{/if}

	<!-- Hidden assignments -->
	{#each Object.entries(hiddenPointsByCategory) as [categoryName, {pointsEarned, pointsPossible}]}
		<li>
			<Assignment
				name={categoryName}
				{pointsEarned}
				{pointsPossible}
				gradePercentageChange={gradePercentageChangesByAssignment[`hidden-${categoryName}`]}
				{hypotheticalMode}
				id={`hidden-${categoryName}`}
				category={showCategories ? categoryName : undefined}
				hidden
				recalculateGradePercentage={recalculateGradePercentages}
			/>
		</li>
	{/each}

	<!-- Regular assignments -->
	{#each assignments as assignment}
		<li>
			<Assignment
				name={assignment._Measure}
				category={showCategories ? assignment._Type : undefined}
				date={new Date(assignment._Date)}
				pointsEarned={extractPoints(assignment._Points)[0]}
				pointsPossible={extractPoints(assignment._Points)[1]}
				gradePercentageChange={gradePercentageChangesByAssignment[assignment._GradebookID]}
				id={assignment._GradebookID}
				notForGrade={assignment._Notes == '(Not For Grading)'}
				{hypotheticalMode}
				recalculateGradePercentage={recalculateGradePercentages}
			/>
		</li>
	{/each}
</ol>
