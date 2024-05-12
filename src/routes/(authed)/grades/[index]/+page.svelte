<script lang="ts">
	import { page } from '$app/stores';
	import Assignments from '$lib/Assignments.svelte';
	import type { AssignmentEntity } from '$lib/Gradebook';
	import type { HypotheticalGradebook } from '$lib/HypotheticalGradebook';
	import { extractPoints, removeClassID } from '$lib/index';
	import { gradebook, hypotheticalGradebook } from '$lib/stores';
	import {
		Alert,
		Button,
		Checkbox,
		Popover,
		TabItem,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tabs
	} from 'flowbite-svelte';
	import {
		ExclamationCircleOutline,
		ExclamationCircleSolid,
		GridPlusOutline,
		InfoCircleOutline,
		InfoCircleSolid
	} from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';

	$: course = $gradebook?.Courses.Course?.[parseInt($page.params.index)];

	$: categories =
		typeof course?.Marks.Mark.GradeCalculationSummary != 'string'
			? course?.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc
			: null;

	$: gradeCategories = categories?.filter((grade) => grade._Type != 'TOTAL');

	$: totalCategory = categories?.find((grade) => grade._Type == 'TOTAL');

	$: assignments = course?.Marks.Mark.Assignments.Assignment ?? [];

	$: assignmentCategories = new Set(
		// fix required for Vercel, cannot reproduce locally
		assignments.length > 0 ? assignments.map((assignment) => assignment._Type).toSorted() : []
	);

	let hiddenPointsByCategory: {
		[categoryName: string]: { pointsEarned: number; pointsPossible: number };
	} = {};

	// Sum points for each category to detect hidden assignments
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
					hiddenPointsByCategory[category._Type] = {
						pointsEarned: hiddenPointsEarned,
						pointsPossible: hiddenPointsPossible
					};
			});
		}
	}

	let hypotheticalMode = false;

	let gradePercentageChangesByAssignment: { [id: string]: number } = {};

	// Calculate the grade percentage changes and initialize the hypothetical gradebook
	$: {
		let hypotheticalGradebookInit: HypotheticalGradebook = {};

		let pointsByCategory: {
			[categoryName: string]: { pointsEarned: number; pointsPossible: number };
		} = {};
		let totalPointsEarned = 0;
		let totalPointsPossible = 0;

		function calculateGradePercentage() {
			let gradePercentage = 0;

			if (!gradeCategories) {
				gradePercentage = (totalPointsEarned / totalPointsPossible) * 100;

				if (isNaN(gradePercentage)) gradePercentage = 0;

				return gradePercentage;
			}

			let totalWeight = 0;

			Object.entries(pointsByCategory).forEach(([categoryName, categoryPoints]) => {
				const category = gradeCategories.find((category) => category._Type == categoryName);
				if (!category) return;

				const weight = parseFloat(category._Weight);

				gradePercentage += (categoryPoints.pointsEarned / categoryPoints.pointsPossible) * weight;
				totalWeight += weight;
			});

			gradePercentage = (gradePercentage / totalWeight) * 100;

			if (isNaN(gradePercentage)) gradePercentage = 0;

			return gradePercentage;
		}

		// Calculate for regular assignments
		assignments.toReversed().forEach((assignment) => {
			const id = assignment._GradebookID;
			const category = assignment._Type;
			const notForGrade = assignment._Notes === '(Not For Grading)';
			const [pointsEarned, pointsPossible] = extractPoints(assignment._Points);

			if (notForGrade || isNaN(pointsEarned)) {
				gradePercentageChangesByAssignment[id] = 0;

				hypotheticalGradebookInit[id] = {
					pointsEarned,
					pointsPossible,
					gradePercentageChange: 0,
					notForGrade
				};

				return;
			}

			// Calculate grade prior to the assignment
			const priorGrade = calculateGradePercentage();

			// Add assignment points to the grade
			totalPointsEarned += pointsEarned;
			totalPointsPossible += pointsPossible;

			const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
			pointsByCategory[category] = {
				pointsEarned: categoryPoints.pointsEarned + pointsEarned,
				pointsPossible: categoryPoints.pointsPossible + pointsPossible
			};

			// Calculate grade after the assignment
			const afterGrade = calculateGradePercentage();

			// Calculate grade percentage change and initalize hypothetical gradebook
			const gradePercentageChange = afterGrade - priorGrade;

			gradePercentageChangesByAssignment[id] = gradePercentageChange;
			hypotheticalGradebookInit[id] = {
				pointsEarned,
				pointsPossible,
				gradePercentageChange,
				notForGrade
			};
		});

		// Calculate for hidden assignments
		Object.entries(hiddenPointsByCategory).forEach(
			([categoryName, { pointsEarned, pointsPossible }]) => {
				const id = `hidden-${categoryName}`;

				// Calculate grade prior to the assignment
				const priorGrade = calculateGradePercentage();

				// Add assignment points to the grade
				totalPointsEarned += pointsEarned;
				totalPointsPossible += pointsPossible;

				const categoryPoints = pointsByCategory[categoryName] ?? {
					pointsEarned: 0,
					pointsPossible: 0
				};
				pointsByCategory[categoryName] = {
					pointsEarned: categoryPoints.pointsEarned + pointsEarned,
					pointsPossible: categoryPoints.pointsPossible + pointsPossible
				};

				// Calculate grade after the assignment
				const afterGrade = calculateGradePercentage();

				// Calculate grade percentage change and initalize hypothetical gradebook
				const gradePercentageChange = afterGrade - priorGrade;

				gradePercentageChangesByAssignment[id] = gradePercentageChange;

				hypotheticalGradebookInit[id] = {
					pointsEarned,
					pointsPossible,
					gradePercentageChange,
					notForGrade: false
				};
			}
		);

		$hypotheticalGradebook = hypotheticalGradebookInit;
	}

	let hypotheticalGrade = 0;
	let rawGradeCalcMatches = true;

	// Calculate hypothetical grade and hypothetical grade percentage changes
	function calculateHypotheticalGrade(assignments: AssignmentEntity[]) {
		let hypotheticalGradebookCache = $hypotheticalGradebook;

		let pointsByCategory: {
			[categoryName: string]: { pointsEarned: number; pointsPossible: number };
		} = {};
		let totalPointsEarned = 0;
		let totalPointsPossible = 0;

		function calculateGradePercentage() {
			let gradePercentage = 0;

			if (!gradeCategories) {
				gradePercentage = (totalPointsEarned / totalPointsPossible) * 100;

				if (isNaN(gradePercentage)) gradePercentage = 0;

				return gradePercentage;
			}

			let totalWeight = 0;

			Object.entries(pointsByCategory).forEach(([categoryName, categoryPoints]) => {
				const category = gradeCategories.find((category) => category._Type == categoryName);
				if (!category) return;

				const weight = parseFloat(category._Weight);

				gradePercentage += (categoryPoints.pointsEarned / categoryPoints.pointsPossible) * weight;
				totalWeight += weight;
			});

			return (gradePercentage / totalWeight) * 100;
		}

		// Calculate hypothetical grade for regular assignments
		assignments.toReversed().forEach((assignment) => {
			const id = assignment._GradebookID;
			const category = assignment._Type;
			const { pointsEarned, pointsPossible, notForGrade } = hypotheticalGradebookCache[id];

			if (notForGrade || isNaN(pointsEarned)) {
				hypotheticalGradebookCache[id].gradePercentageChange = 0;
				return;
			}

			// Calculate grade prior to the assignment
			const priorGrade = calculateGradePercentage();

			// Add assignment points to the grade
			totalPointsEarned += pointsEarned;
			totalPointsPossible += pointsPossible;

			const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
			pointsByCategory[category] = {
				pointsEarned: categoryPoints.pointsEarned + pointsEarned,
				pointsPossible: categoryPoints.pointsPossible + pointsPossible
			};

			// Calculate grade after the assignment
			const afterGrade = calculateGradePercentage();

			// Calculate grade percentage change
			hypotheticalGradebookCache[id].gradePercentageChange = afterGrade - priorGrade;
		});

		// Check if the calculated grade matches the raw grade
		// if (!gradeCategories && course) {
		// 	let rawGrade = (totalPointsEarned / totalPointsPossible) * 100;
		// 	if (isNaN(rawGrade)) rawGrade = 0;
		// 	let synergyGrade = parseFloat(course.Marks.Mark._CalculatedScoreRaw);

		// 	let decimalPlaces = 0;
		// 	if (synergyGrade % 1 != 0) decimalPlaces = synergyGrade.toString().split('.')[1].length;

		// 	if (Math.floor(rawGrade * 10 ** decimalPlaces) / 10 ** decimalPlaces != synergyGrade)
		// 		rawGradeCalcMatches = false;
		// }

		// Calculate hypothetical grade for hidden assignments
		Object.keys(hiddenPointsByCategory).forEach((categoryName) => {
			const id = `hidden-${categoryName}`;
			const { pointsEarned, pointsPossible, notForGrade } = hypotheticalGradebookCache[id];

			if (notForGrade || isNaN(pointsEarned)) {
				hypotheticalGradebookCache[id].gradePercentageChange = 0;
				return;
			}

			// Calculate grade prior to the assignment
			const priorGrade = calculateGradePercentage();

			// Add assignment points to the grade
			totalPointsEarned += pointsEarned;
			totalPointsPossible += pointsPossible;

			const categoryPoints = pointsByCategory[categoryName] ?? {
				pointsEarned: 0,
				pointsPossible: 0
			};
			pointsByCategory[categoryName] = {
				pointsEarned: categoryPoints.pointsEarned + pointsEarned,
				pointsPossible: categoryPoints.pointsPossible + pointsPossible
			};

			// Calculate grade after the assignment
			const afterGrade = calculateGradePercentage();

			// Calculate grade percentage change
			hypotheticalGradebookCache[id].gradePercentageChange = afterGrade - priorGrade;
		});

		// Calculate grade for hypothetical assignments
		Object.keys(hypotheticalGradebookCache)
			.filter((id) => id.startsWith('hypothetical-'))
			.forEach((id) => {
				const { pointsEarned, pointsPossible, notForGrade, category } =
					hypotheticalGradebookCache[id];

				if (notForGrade || isNaN(pointsEarned) || (gradeCategories && !category)) {
					hypotheticalGradebookCache[id].gradePercentageChange = 0;
					return;
				}

				// Calculate grade prior to the assignment
				const priorGrade = calculateGradePercentage();

				// Add assignment points to the grade
				totalPointsEarned += pointsEarned;
				totalPointsPossible += pointsPossible;

				const categoryPoints = pointsByCategory[category ?? 'hypothetical'] ?? {
					pointsEarned: 0,
					pointsPossible: 0
				};
				pointsByCategory[category ?? 'hypothetical'] = {
					pointsEarned: categoryPoints.pointsEarned + pointsEarned,
					pointsPossible: categoryPoints.pointsPossible + pointsPossible
				};

				// Calculate grade after the assignment
				const afterGrade = calculateGradePercentage();

				// Calculate grade percentage change
				hypotheticalGradebookCache[id].gradePercentageChange = afterGrade - priorGrade;
			});

		hypotheticalGrade = calculateGradePercentage();

		$hypotheticalGradebook = hypotheticalGradebookCache;
	}

	$: calculateHypotheticalGrade(assignments);

	function recalculateGradePercentages() {
		calculateHypotheticalGrade(assignments);
	}

	function addHypotheticalAssignment() {
		$hypotheticalGradebook[`hypothetical-${Math.random().toString(36).substring(2, 15)}`] = {
			pointsEarned: 0,
			pointsPossible: 0,
			gradePercentageChange: 0,
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
				GradeVue cannot show hidden assignments for this class. If there are any, they have not significantly
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
			<div transition:fade={{ duration: 200 }}>
				<Button color="light" class="mx-4" on:click={addHypotheticalAssignment}>
					<GridPlusOutline size="sm" class="mr-2 focus:outline-none" />
					Add Hypothetical Assignment
				</Button>
			</div>
		{/if}
	</div>

	{#if assignments.length > 0 || hypotheticalMode}
		<Popover triggeredBy=".hidden-badge" class="max-w-md">
			Teachers can choose to have assignments hidden from the assignment list but still calculated
			toward your grade. GradeVue can reveal these assignments.
		</Popover>

		<div transition:fade={{ duration: 200 }}>
			<Tabs class="m-4 mb-0" contentClass="p-4">
				<TabItem open title="All">
					<Assignments
						{assignments}
						{hiddenPointsByCategory}
						{hypotheticalMode}
						hypotheticalCategoryOptions={gradeCategories?.map((category) => category._Type) ?? []}
						{gradePercentageChangesByAssignment}
						{recalculateGradePercentages}
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
							{gradePercentageChangesByAssignment}
							{recalculateGradePercentages}
						/>
					</TabItem>
				{/each}
			</Tabs>
		</div>
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
						{Math.round(hypotheticalGrade * 1000) / 1000}%
					{:else}
						{course.Marks.Mark._CalculatedScoreString}
						{course.Marks.Mark._CalculatedScoreRaw}%
					{/if}
				</span>
			</div>
		</div>
	</div>
{/if}
