<script lang="ts">
	import Assignments from '$lib/Assignments.svelte';
	import { gradebook, hypotheticalGradebook } from '$lib/stores';
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
		TabItem,
		Checkbox,
		Alert,
		Popover
	} from 'flowbite-svelte';
	import { InfoCircleOutline, InfoCircleSolid } from 'flowbite-svelte-icons';

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
				const [categoryPointsEarned, categoryPointsPossible] = pointsByCategory[assignment._Type];

				const points = extractPoints(assignment._Points);
				if (!points) return;
				const [pointsEarned, pointsPossible] = points;

				pointsByCategory[assignment._Type] = [
					categoryPointsEarned + pointsEarned,
					categoryPointsPossible + pointsPossible
				];
			});

			gradeCategories?.forEach((category) => {
				const [points, pointsPossible] = pointsByCategory[category._Type];

				const hiddenPointsEarned = parseFloat(category._Points) - points;
				const hiddenPointsPossible = parseFloat(category._PointsPossible) - pointsPossible;

				if (hiddenPointsEarned && hiddenPointsPossible)
					hiddenPointsByCategory[category._Type] = [hiddenPointsEarned, hiddenPointsPossible];
			});
		}
	}

	let hypotheticalMode = false;

	$: {
		let hypotheticalPoints: { [gradebookID: string]: [number, number] } = {};

		assignments?.forEach((assignment) => {
			hypotheticalPoints[assignment._GradebookID] = extractPoints(assignment._Points);
		});

		Object.entries(hiddenPointsByCategory).forEach(
			([categoryName, [pointsEarned, pointsPossible]]) => {
				hypotheticalPoints[`hidden-${categoryName}`] = [pointsEarned, pointsPossible];
			}
		);

		$hypotheticalGradebook = hypotheticalPoints;
	}
</script>

{JSON.stringify($hypotheticalGradebook)}

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
		<div class="my-4 sm:m-4">
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
	{:else}
		<Alert class="m-4" color="dark">
			<InfoCircleSolid slot="icon" size="sm" />
			Gradebook cannot show hidden assignments because your class does not have grade categories.
		</Alert>
	{/if}
	{#if assignments}
		<Checkbox bind:checked={hypotheticalMode} class="ml-4">
			<div id="hypothetical-toggle" class="flex items-center">
				Hypothetical Mode
				<InfoCircleOutline class="ml-2" size="sm" />
			</div>
		</Checkbox>
		<Popover triggeredBy="#hypothetical-toggle" class="max-w-md">
			Hypothetical mode allows you to see what your grade would be if you got a certain score on an
			assignment.
		</Popover>

		<Tabs class="ml-4 mt-4" contentClass="p-4">
			<TabItem open title="All">
				<Assignments {assignments} {hiddenPointsByCategory} {hypotheticalMode} />
			</TabItem>
			{#each assignmentCategories as category}
				<TabItem title={category}>
					<Assignments
						assignments={assignments.filter((assignment) => assignment._Type == category)}
						showCategories={false}
						hiddenPointsByCategory={Object.fromEntries(
							Object.entries(hiddenPointsByCategory).filter(
								([categoryName]) => categoryName == category
							)
						)}
						{hypotheticalMode}
					/>
				</TabItem>
			{/each}
		</Tabs>
	{/if}
{/if}
