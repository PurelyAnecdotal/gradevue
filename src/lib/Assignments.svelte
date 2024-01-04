<script lang="ts">
	import type { AssignmentEntity } from './Gradebook';
	import Assignment from './Assignment.svelte';
	import { extractPoints } from '$lib';

	export let assignments: AssignmentEntity[];
	export let showCategories = true;
	export let hiddenPointsByCategory: { [categoryName: string]: [number, number] } = {};
	export let hypotheticalMode = false;
	export let hypotheticalAssignments: {
		name: string;
		pointsEarned: number;
		pointsPossible: number;
		id: string;
		category?: string;
	}[] = [];
	export let hypotheticalCategoryOptions: string[] = [];
</script>

<ol class="space-y-4">
	{#each hypotheticalAssignments as hypotheticalAssignment}
		<li>
			<Assignment
				name={hypotheticalAssignment.name}
				pointsEarned={hypotheticalAssignment.pointsEarned}
				pointsPossible={hypotheticalAssignment.pointsPossible}
				id={hypotheticalAssignment.id}
				category={hypotheticalAssignment.category}
				{hypotheticalMode}
				hypothetical
				{hypotheticalCategoryOptions}
			/>
		</li>
	{/each}

	{#each Object.entries(hiddenPointsByCategory) as [categoryName, [pointsEarned, pointsPossible]]}
		<li>
			<Assignment
				name={categoryName}
				{pointsEarned}
				{pointsPossible}
				{hypotheticalMode}
				id={`hidden-${categoryName}`}
				hidden
			/>
		</li>
	{/each}

	{#each assignments as assignment}
		<li>
			<Assignment
				name={assignment._Measure}
				category={showCategories ? assignment._Type : undefined}
				date={new Date(assignment._Date)}
				pointsEarned={extractPoints(assignment._Points)[0]}
				pointsPossible={extractPoints(assignment._Points)[1]}
				id={assignment._GradebookID}
				notForGrade={assignment._Notes == '(Not For Grading)'}
				{hypotheticalMode}
			/>
		</li>
	{/each}
</ol>
