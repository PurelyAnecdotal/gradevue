<script lang="ts">
	import Assignments from '$lib/Assignments.svelte';
	import { gradebook } from '$lib/stores';
	import { page } from '$app/stores';
	import { removeClassID } from '$lib/index';
	import {
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tabs,
		TabItem
	} from 'flowbite-svelte';

	$: course = $gradebook?.Courses.Course?.[parseInt($page.params.index)];

	$: gradeCategories =
		typeof course?.Marks.Mark.GradeCalculationSummary != 'string'
			? course?.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc
			: null;

	$: assignmentCategories = [
		...new Set(
			course?.Marks.Mark.Assignments.Assignment?.map((assignment) => assignment._Type) ?? []
		)
	];
</script>

{#if course}
	<Heading tag="h1" class="sm:mt-12 ml-4 w-fit">{removeClassID(course._Title)}</Heading>
	{#if gradeCategories}
		<div class="mt-4 sm:m-4">
			<Table shadow>
				<TableHead>
					<TableHeadCell>Category</TableHeadCell>
					<TableHeadCell>Grade</TableHeadCell>
					<TableHeadCell>Weight</TableHeadCell>
					<TableHeadCell>Points</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each gradeCategories as category}
						<TableBodyRow>
							<TableBodyCell>{category._Type}</TableBodyCell>
							<TableBodyCell>{category._CalculatedMark}</TableBodyCell>
							<TableBodyCell>{category._Weight}</TableBodyCell>
							<TableBodyCell>
								{parseFloat(category._Points)} / {parseFloat(category._PointsPossible)}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
	<Tabs class="ml-4 mt-4" contentClass="p-4 bg-gray-50 rounded-lg dark:bg-gray-900">
		<TabItem open title="All">
			<Assignments {course} />
		</TabItem>
		{#each assignmentCategories as category}
			<TabItem title={category}>
				<Assignments {course} {category} />
			</TabItem>
		{/each}
	</Tabs>
{/if}
