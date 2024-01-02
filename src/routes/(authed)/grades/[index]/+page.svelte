<script lang="ts">
	import Assignments from '$lib/Assignments.svelte';
	import { gradebook, hypotheticalGradebook } from '$lib/stores';
	import { page } from '$app/stores';
	import { removeClassID, extractPoints } from '$lib/index';
	import {
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
				if (assignment._Notes === '(Not For Grading)') return;

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
		let hypotheticalPoints: { [gradebookID: string]: [number, number, boolean] } = {};

		assignments?.forEach((assignment) => {
			hypotheticalPoints[assignment._GradebookID] = [
				...extractPoints(assignment._Points),
				assignment._Notes == '(Not For Grading)'
			];
		});

		Object.entries(hiddenPointsByCategory).forEach(
			([categoryName, [pointsEarned, pointsPossible]]) => {
				hypotheticalPoints[`hidden-${categoryName}`] = [pointsEarned, pointsPossible, false];
			}
		);

		$hypotheticalGradebook = Object.fromEntries(
			Object.entries(hypotheticalPoints).map(([id, [pointsEarned, pointsPossible]]) => [
				id,
				[pointsEarned.toString(), pointsPossible.toString(), hypotheticalPoints[id][2]]
			])
		);
	}

	let hypotheticalGrade = 0;
	$: {
		let pointsByCategory: { [categoryName: string]: [number, number] } = {};

		assignments?.forEach((assignment) => {
			if ($hypotheticalGradebook[assignment._GradebookID][2] == true) return;

			const points = pointsByCategory[assignment._Type] ?? [0, 0];
			const hypotheticalPoints = [
				parseFloat($hypotheticalGradebook[assignment._GradebookID][0]),
				parseFloat($hypotheticalGradebook[assignment._GradebookID][1])
			];

			if (isNaN(hypotheticalPoints[0])) return;

			pointsByCategory[assignment._Type] = [
				points[0] + hypotheticalPoints[0],
				points[1] + hypotheticalPoints[1]
			];
		});

		Object.keys(hiddenPointsByCategory).forEach((categoryName) => {
			const points = pointsByCategory[categoryName] ?? [0, 0];
			const hypotheticalPoints = [
				parseFloat($hypotheticalGradebook[`hidden-${categoryName}`][0]),
				parseFloat($hypotheticalGradebook[`hidden-${categoryName}`][1])
			];

			if (isNaN(hypotheticalPoints[0])) return;

			pointsByCategory[categoryName] = [
				points[0] + hypotheticalPoints[0],
				points[1] + hypotheticalPoints[1]
			];
		});

		hypotheticalGrade = 0;
		let weight = 0;

		Object.entries(pointsByCategory).forEach(([categoryName, [pointsEarned, pointsPossible]]) => {
			const category = gradeCategories?.find((category) => category._Type == categoryName);
			if (!category) return;

			hypotheticalGrade += (pointsEarned / pointsPossible) * parseFloat(category._Weight);
			weight += parseFloat(category._Weight);
		});

		hypotheticalGrade = hypotheticalGrade / weight;
	}
</script>

{#if course}
	<div class="h-8 md:h-14" />

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

		<Popover triggeredBy=".hidden-badge" class="max-w-md">
			Teachers can choose to have assignments hidden from the assignment list but still calculated
			toward your grade. Gradebook can reveal these assignments.
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

	<div class="top-12 left-0 w-full fixed md:top-0">
		<div class="absolute w-full md:pl-64">
			<div class="p-4 rounded-b-lg bg-gray-900 rounded flex justify-between">
				<span class="line-clamp-1 text-2xl">
					{removeClassID(course._Title)}
				</span>
				<span class="shrink-0 text-2xl">
					{#if hypotheticalMode}
						{Math.round(hypotheticalGrade * 100000) / 1000}%
					{:else}
						{course.Marks.Mark._CalculatedScoreString}
						{course.Marks.Mark._CalculatedScoreRaw}%
					{/if}
				</span>
			</div>
		</div>
	</div>
{/if}
