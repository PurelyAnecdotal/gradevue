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
		Popover,
		Button
	} from 'flowbite-svelte';
	import {
		ExclamationCircleOutline,
		ExclamationCircleSolid,
		GridPlusOutline,
		InfoCircleOutline,
		InfoCircleSolid
	} from 'flowbite-svelte-icons';

	$: course = $gradebook?.Courses.Course?.[parseInt($page.params.index)];

	$: categories =
		typeof course?.Marks.Mark.GradeCalculationSummary != 'string'
			? course?.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc
			: null;

	$: gradeCategories = categories?.filter((grade) => grade._Type != 'TOTAL');

	$: totalCategory = categories?.find((grade) => grade._Type == 'TOTAL');

	$: assignmentCategories = new Set(
		course?.Marks.Mark.Assignments.Assignment?.map((assignment) => assignment._Type).toSorted()
	);

	$: assignments = course?.Marks.Mark.Assignments.Assignment ?? [];

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
		let hypotheticalGradebookInit: {
			[gradebookID: string]: { pointsEarned: number; pointsPossible: number; notForGrade: boolean };
		} = {};

		assignments?.forEach((assignment) => {
			hypotheticalGradebookInit[assignment._GradebookID] = {
				pointsEarned: extractPoints(assignment._Points)[0],
				pointsPossible: extractPoints(assignment._Points)[1],
				notForGrade: assignment._Notes == '(Not For Grading)'
			};
		});

		Object.entries(hiddenPointsByCategory).forEach(
			([categoryName, [pointsEarned, pointsPossible]]) => {
				hypotheticalGradebookInit[`hidden-${categoryName}`] = {
					pointsEarned,
					pointsPossible,
					notForGrade: false
				};
			}
		);

		$hypotheticalGradebook = Object.fromEntries(
			Object.entries(hypotheticalGradebookInit).map(
				([id, { pointsEarned, pointsPossible, notForGrade }]) => [
					id,
					{
						pointsEarned: pointsEarned.toString(),
						pointsPossible: pointsPossible.toString(),
						notForGrade
					}
				]
			)
		);
	}

	let hypotheticalGrade = 0;
	let rawGradeCalcMatches = true;
	$: {
		let pointsByCategory: { [categoryName: string]: [number, number] } = {};

		assignments?.forEach((assignment) => {
			if ($hypotheticalGradebook[assignment._GradebookID].notForGrade == true) return;

			const points = pointsByCategory[assignment._Type] ?? [0, 0];
			const hypotheticalPoints = [
				parseFloat($hypotheticalGradebook[assignment._GradebookID].pointsEarned),
				parseFloat($hypotheticalGradebook[assignment._GradebookID].pointsPossible)
			];

			if (isNaN(hypotheticalPoints[0])) return;

			pointsByCategory[assignment._Type] = [
				points[0] + hypotheticalPoints[0],
				points[1] + hypotheticalPoints[1]
			];
		});

		if (!gradeCategories && course) {
			let totalPointsEarned = 0;
			let totalPointsPossible = 0;

			Object.entries(pointsByCategory).forEach(
				([_categoryName, [pointsEarned, pointsPossible]]) => {
					totalPointsEarned += pointsEarned;
					totalPointsPossible += pointsPossible;
				}
			);

			let rawGrade = (totalPointsEarned / totalPointsPossible) * 100;
			if (isNaN(rawGrade)) rawGrade = 0;
			let synergyGrade = parseFloat(course.Marks.Mark._CalculatedScoreRaw);

			let decimalPlaces = 0;
			if (synergyGrade % 1 != 0) decimalPlaces = synergyGrade.toString().split('.')[1].length;

			if (Math.floor(rawGrade * 10 ** decimalPlaces) / 10 ** decimalPlaces != synergyGrade)
				rawGradeCalcMatches = false;
		}

		Object.keys(hiddenPointsByCategory).forEach((categoryName) => {
			const points = pointsByCategory[categoryName] ?? [0, 0];
			const hypotheticalPoints = [
				parseFloat($hypotheticalGradebook[`hidden-${categoryName}`].pointsEarned),
				parseFloat($hypotheticalGradebook[`hidden-${categoryName}`].pointsPossible)
			];

			if (isNaN(hypotheticalPoints[0])) return;

			pointsByCategory[categoryName] = [
				points[0] + hypotheticalPoints[0],
				points[1] + hypotheticalPoints[1]
			];
		});

		Object.keys($hypotheticalGradebook)
			.filter((id) => id.startsWith('hypothetical-'))
			.map((id) => $hypotheticalGradebook[id])
			.forEach((assignment) => {
				if (assignment.notForGrade == true || (gradeCategories && !assignment.category)) return;

				const points = pointsByCategory[assignment.category ?? 'hypothetical'] ?? [0, 0];
				const hypotheticalPoints = [
					parseFloat(assignment.pointsEarned),
					parseFloat(assignment.pointsPossible)
				];

				if (isNaN(hypotheticalPoints[0])) return;

				pointsByCategory[assignment.category ?? 'hypothetical'] = [
					points[0] + hypotheticalPoints[0],
					points[1] + hypotheticalPoints[1]
				];
			});

		hypotheticalGrade = 0;

		if (gradeCategories) {
			let weight = 0;

			Object.entries(pointsByCategory).forEach(([categoryName, [pointsEarned, pointsPossible]]) => {
				const category = gradeCategories?.find((category) => category._Type == categoryName);
				if (!category) return;

				hypotheticalGrade += (pointsEarned / pointsPossible) * parseFloat(category._Weight);
				weight += parseFloat(category._Weight);
			});

			hypotheticalGrade = hypotheticalGrade / weight;
		} else {
			let totalPoints = 0;

			Object.entries(pointsByCategory).forEach(
				([_categoryName, [pointsEarned, pointsPossible]]) => {
					hypotheticalGrade += pointsEarned;
					totalPoints += pointsPossible;
				}
			);

			hypotheticalGrade = hypotheticalGrade / totalPoints;
		}

		if (isNaN(hypotheticalGrade)) hypotheticalGrade = 0;
	}

	function addHypotheticalAssignment() {
		$hypotheticalGradebook[`hypothetical-${Math.random().toString(36).substring(2, 15)}`] = {
			pointsEarned: '0',
			pointsPossible: '0',
			notForGrade: false,
			name: 'Hypothetical Assignment'
		};
	}
</script>

{#if course}
	<div class="h-12 md:h-14" />

	{#if gradeCategories}
		<div class="sm:mx-4">
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

	{#if !gradeCategories}
		{#if rawGradeCalcMatches}
			<Alert class="m-4" color="dark">
				<InfoCircleSolid slot="icon" size="sm" class="focus:outline-none" />
				Gradebook cannot show hidden assignments for this class. If there are any, they have not significantly
				affected the grade percentage.
			</Alert>
		{:else}
			<Alert class="m-4" color="red" border>
				<ExclamationCircleSolid slot="icon" size="sm" class="focus:outline-none" />
				Your class's grade percentage does not match the calculated grade percentage. This indicates
				the presence of hidden assignments that cannot be revealed.
				<span class="font-bold">Hypothetical grade calculations will be inaccurate.</span>
			</Alert>
		{/if}
	{/if}

	<div class="flex flex-wrap justify-between items-center">
		<Checkbox bind:checked={hypotheticalMode} class="m-4">
			<div id="hypothetical-toggle" class="flex items-center mr-2">
				Hypothetical Mode
				<InfoCircleOutline size="sm" class="ml-2 focus:outline-none" />
			</div>
		</Checkbox>
		<Popover triggeredBy="#hypothetical-toggle" class="max-w-md">
			Hypothetical mode allows you to see what your grade would be if you got a certain score on an
			assignment.
		</Popover>

		{#if hypotheticalMode}
			<Button color="light" class="mx-4" on:click={addHypotheticalAssignment}>
				<GridPlusOutline size="sm" class="mr-2 focus:outline-none" />
				Add Hypothetical Assignment
			</Button>
		{/if}
	</div>

	{#if assignments.length > 0 || hypotheticalMode}
		<Popover triggeredBy=".hidden-badge" class="max-w-md">
			Teachers can choose to have assignments hidden from the assignment list but still calculated
			toward your grade. Gradebook can reveal these assignments.
		</Popover>

		<Tabs class="m-4 mb-0" contentClass="m-4">
			<TabItem open title="All">
				<Assignments
					{assignments}
					{hiddenPointsByCategory}
					{hypotheticalMode}
					hypotheticalCategoryOptions={gradeCategories?.map((category) => category._Type) ?? []}
				/>
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
						hypotheticalCategoryOptions={gradeCategories?.map((category) => category._Type) ?? []}
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
				<span class="shrink-0 text-2xl flex items-center">
					{#if hypotheticalMode}
						{#if !gradeCategories && !rawGradeCalcMatches}
							<ExclamationCircleOutline class="mr-2 focus:outline-none" />
						{/if}
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
