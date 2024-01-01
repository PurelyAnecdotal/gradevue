<script lang="ts">
	import Assignments from '$lib/Assignments.svelte';
	import { gradebook } from '$lib/stores';
	import { page } from '$app/stores';
	import { removeClassID, extractPoints } from '$lib/index';
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

	$: categories =
		typeof course?.Marks.Mark.GradeCalculationSummary != 'string'
			? course?.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc
			: null;

	$: gradeCategories = categories?.filter((grade) => grade._Type != 'TOTAL');

	$: totalCategory = categories?.find((grade) => grade._Type == 'TOTAL');

	$: assignmentCategories = [
		...new Set(course?.Marks.Mark.Assignments.Assignment?.map((assignment) => assignment._Type))
	].toSorted();

	$: assignments = course?.Marks.Mark.Assignments.Assignment;

	let hiddenPointsByCategory: { [categoryName: string]: [number, number] } = {};

	$: {
		if (categories) {
			let pointsByCategory: { [categoryName: string]: [number, number] } = {};

			gradeCategories?.forEach((category) => {
				pointsByCategory[category._Type] = [0, 0];
			});

			assignments?.forEach((assignment) => {
				const [categoryPoints, categoryPointsPossible] = pointsByCategory[assignment._Type];

				const [points, pointsPossible] = extractPoints(assignment._Points);
				if (pointsPossible === undefined) return;

				pointsByCategory[assignment._Type] = [
					categoryPoints + points,
					categoryPointsPossible + pointsPossible
				];
			});

			gradeCategories?.forEach((category) => {
				const [points, pointsPossible] = pointsByCategory[category._Type];

				hiddenPointsByCategory[category._Type] = [
					parseFloat(category._Points) - points,
					parseFloat(category._PointsPossible) - pointsPossible
				];
			});
		}
	}
</script>

{#if course}
	<div class="mx-4 flex justify-between md:mt-12">
		<Heading tag="h1" class="w-fit line-clamp-1 text-3xl sm:text-4xl ">
			{removeClassID(course._Title)}
		</Heading>
		<Heading tag="h1" class="w-fit shrink-0 text-3xl sm:text-4xl">
			{course.Marks.Mark._CalculatedScoreString}
			{course.Marks.Mark._CalculatedScoreRaw}%
		</Heading>
	</div>
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
					{#each gradeCategories.toSorted() as category}
						<TableBodyRow>
							<TableBodyCell>{category._Type}</TableBodyCell>
							<TableBodyCell>{category._CalculatedMark}</TableBodyCell>
							<TableBodyCell>{category._Weight}</TableBodyCell>
							<TableBodyCell>
								{parseFloat(category._Points)} / {parseFloat(category._PointsPossible)}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
					{#if totalCategory}
						<TableBodyRow>
							<TableBodyCell>Total</TableBodyCell>
							<TableBodyCell>{totalCategory._CalculatedMark}</TableBodyCell>
							<TableBodyCell />
							<TableBodyCell>
								{parseFloat(totalCategory._Points)} / {parseFloat(totalCategory._PointsPossible)}
							</TableBodyCell>
						</TableBodyRow>
					{/if}
				</TableBody>
			</Table>
		</div>
	{/if}
	{#if assignments}
		<Tabs class="ml-4 mt-4" contentClass="p-4 bg-gray-50 rounded-lg dark:bg-gray-900">
			<TabItem open title="All">
				<Assignments {assignments} {hiddenPointsByCategory} />
			</TabItem>
			{#each assignmentCategories as category}
				<TabItem title={category}>
					<Assignments {assignments} {category} {hiddenPointsByCategory} />
				</TabItem>
			{/each}
		</Tabs>
	{/if}
{/if}
