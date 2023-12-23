<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import type { CourseEntity } from './Gradebook';

	export let course: CourseEntity;
	export let category: string | undefined = undefined;

	$: assignments = course.Marks.Mark.Assignments.Assignment
		? course.Marks.Mark.Assignments.Assignment.filter(
				(assignment) => category === undefined || assignment._Type === category
			)
		: [];
</script>

{#if course.Marks.Mark.Assignments.Assignment}
	<ol>
		{#each assignments as assignment}
			<li>
				<Card
					class="dark:text-white sm:p-4 mb-4 max-w-none flex flex-row justify-between items-center"
				>
					{assignment._Measure}: {assignment._Score} ({assignment._Date}{#if !category}, {assignment._Type}{/if})
				</Card>
			</li>
		{/each}
	</ol>
{/if}
