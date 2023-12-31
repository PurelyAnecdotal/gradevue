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

	$: sortedCategories = gradeCategories?.toSorted((a, b) => {
		if (a._Type == 'TOTAL') return 1;
		if (b._Type == 'TOTAL') return -1;
		return a._Type.localeCompare(b._Type);
	});

	$: assignmentCategories = [
		...new Set(
			course?.Marks.Mark.Assignments.Assignment?.map((assignment) => assignment._Type) ?? []
		)
	].toSorted();
</script>

{#if course}
	<div class="md:mt-12 mx-4 space-y-4 md:flex md:justify-between md:space-y-0">
		<Heading tag="h1" class="w-fit text-4xl md:line-clamp-1">{removeClassID(course._Title)}</Heading>
		<Heading tag="h1" class="w-fit text-4xl shrink-0">
			{course.Marks.Mark._CalculatedScoreString}
			{course.Marks.Mark._CalculatedScoreRaw}%
		</Heading>
	</div>
	{#if gradeCategories && sortedCategories}
		<div class="mt-4 sm:m-4">
			<Table shadow>
				<TableHead>
					<TableHeadCell>Category</TableHeadCell>
					<TableHeadCell>Grade</TableHeadCell>
					<TableHeadCell>Weight</TableHeadCell>
					<TableHeadCell>Points</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each sortedCategories as category}
						<TableBodyRow>
							<TableBodyCell>{category._Type == 'TOTAL' ? 'Total' : category._Type}</TableBodyCell>
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
