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

	$: course = $gradebook.Courses.Course
		? $gradebook.Courses.Course[parseInt($page.params.index)]
		: null;
</script>

{#if course}
	<Heading tag="h1" class="sm:mt-12 ml-4 w-fit">{removeClassID(course._Title)}</Heading>
	{#if typeof course.Marks.Mark.GradeCalculationSummary != 'string'}
		<div class="mt-4 mb-4 sm:m-4">
			<Table shadow>
				<TableHead>
					<TableHeadCell>Category</TableHeadCell>
					<TableHeadCell>Grade</TableHeadCell>
					<TableHeadCell>Weight</TableHeadCell>
					<TableHeadCell>Points</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each course.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc ?? [] as category}
						<TableBodyRow>
							<TableBodyCell>{category._Type}</TableBodyCell>
							<TableBodyCell>{category._CalculatedMark}</TableBodyCell>
							<TableBodyCell>{category._Weight}</TableBodyCell>
							<TableBodyCell
								>{parseFloat(category._Points)} / {parseFloat(
									category._PointsPossible
								)}</TableBodyCell
							>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>
		<Tabs class="ml-4" contentClass="p-4 bg-gray-50 rounded-lg dark:bg-gray-900">
			<TabItem open title="All">
				<Assignments {course} />
			</TabItem>
			{#each course.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc?.filter((category) => category._Type !== 'TOTAL') ?? [] as category}
				<TabItem title={category._Type}>
					<Assignments {course} category={category._Type} />
				</TabItem>
			{/each}
		</Tabs>
	{:else if course.Marks.Mark.Assignments.Assignment}
		<div class="m-4"><Assignments {course} /></div>
	{/if}
{/if}
