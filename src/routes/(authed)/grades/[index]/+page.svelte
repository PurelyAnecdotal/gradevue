<script lang="ts">
	import { page } from '$app/stores';
	import { extractPoints, removeClassID } from '$lib';
	import Assignment from '$lib/components/Assignment.svelte';
	import { gradebook } from '$lib/stores';
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

	$: gradeCalcSummary = course?.Marks.Mark.GradeCalculationSummary;

	$: categories =
		typeof gradeCalcSummary != 'string' ? gradeCalcSummary?.AssignmentGradeCalc : null;

	$: gradeCategories = categories?.filter((grade) => grade._Type != 'TOTAL');

	$: totalCategory = categories?.find((grade) => grade._Type == 'TOTAL');

	$: assignments = course?.Marks.Mark.Assignments.Assignment ?? [];

	$: assignmentCategories = new Set(
		// fix required for Vercel, cannot reproduce locally
		assignments.length > 0 ? assignments.map((assignment) => assignment._Type).toSorted() : []
	);

	$: categoryDropdownOptions = gradeCategories?.map((category) => category._Type) ?? [];

	interface DisplayAssignment {
		name: string;
		pointsEarned: number;
		pointsPossible: number;
		gradePercentageChange: number;
		notForGrade: boolean;
		hidden: boolean;
		hypothetical: boolean;
		category: string;
		date?: Date;
	}

	let displayAssignments: DisplayAssignment[] = [];

	let hypotheticalAssignments: DisplayAssignment[] = [];

	function calculateGradePercentage(
		totalPointsEarned: number,
		totalPointsPossible: number,
		pointsByCategory: {
			[categoryName: string]: { pointsEarned: number; pointsPossible: number };
		}
	) {
		let gradePercentage = 0;

		if (!gradeCategories) {
			gradePercentage = (totalPointsEarned / totalPointsPossible) * 100;

			if (isNaN(gradePercentage)) gradePercentage = 0;

			return gradePercentage;
		}

		if (Object.entries(pointsByCategory).length == 0) return 0;

		let totalWeight = 0;

		Object.entries(pointsByCategory).forEach(([categoryName, categoryPoints]) => {
			const category = gradeCategories.find((category) => category._Type == categoryName);
			if (!category) return;

			const weight = parseFloat(category._Weight);

			gradePercentage += (categoryPoints.pointsEarned / categoryPoints.pointsPossible) * weight;
			totalWeight += weight;
		});

		gradePercentage = (gradePercentage / totalWeight) * 100;

		if (isNaN(gradePercentage)) {
			console.error('Grade percentage is NaN');
			return 0;
		}

		return gradePercentage;
	}

	// Initialize the gradebook
	$: {
		let pointsByCategory: {
			[categoryName: string]: { pointsEarned: number; pointsPossible: number };
		} = {};
		let totalPointsEarned = 0;
		let totalPointsPossible = 0;

		// Initialize regular assignments
		let regularAssignmentsInit: DisplayAssignment[] = assignments.map((assignment) => {
			const points = extractPoints(assignment._Points);
			return {
				name: assignment._Measure,
				pointsEarned: points[0],
				pointsPossible: points[1],
				gradePercentageChange: 0,
				notForGrade: assignment._Notes === '(Not For Grading)',
				hidden: false,
				hypothetical: false,
				category: assignment._Type,
				date: new Date(assignment._Date)
			};
		});

		// Calculate grade percentage change for regular assignments
		regularAssignmentsInit = regularAssignmentsInit
			.toReversed()
			.map((assignment) => {
				const { category, notForGrade, pointsEarned, pointsPossible } = assignment;

				if (notForGrade || isNaN(pointsEarned)) return assignment;

				// Calculate grade prior to the assignment
				const priorGrade = calculateGradePercentage(
					totalPointsEarned,
					totalPointsPossible,
					pointsByCategory
				);

				// Add assignment points to the grade
				totalPointsEarned += pointsEarned;
				totalPointsPossible += pointsPossible;

				const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
				pointsByCategory[category] = {
					pointsEarned: categoryPoints.pointsEarned + pointsEarned,
					pointsPossible: categoryPoints.pointsPossible + pointsPossible
				};

				// Calculate grade after the assignment
				const afterGrade = calculateGradePercentage(
					totalPointsEarned,
					totalPointsPossible,
					pointsByCategory
				);

				// Calculate grade percentage change and initalize hypothetical gradebook
				const gradePercentageChange = afterGrade - priorGrade;

				return { ...assignment, gradePercentageChange };
			})
			.toReversed();

		// Initalize hidden assignments if the gradebook has categories in order to detect them
		let hiddenAssignmentsInit: DisplayAssignment[] = [];

		if (categories) {
			gradeCategories?.forEach((category) => {
				const { pointsEarned, pointsPossible } = pointsByCategory[category._Type] ?? {
					pointsEarned: 0,
					pointsPossible: 0
				};

				const hiddenPointsEarned = parseFloat(category._Points) - pointsEarned;
				const hiddenPointsPossible = parseFloat(category._PointsPossible) - pointsPossible;

				if (!hiddenPointsEarned || !hiddenPointsPossible) return;

				hiddenAssignmentsInit.push({
					name: `Hidden ${category._Type} Assignments`,
					pointsEarned: hiddenPointsEarned,
					pointsPossible: hiddenPointsPossible,
					gradePercentageChange: 0,
					notForGrade: false,
					hidden: true,
					hypothetical: false,
					category: category._Type
				});
			});

			// Calculate grade percentage change for hidden assignments
			hiddenAssignmentsInit = hiddenAssignmentsInit.map((assignment) => {
				const { pointsEarned, pointsPossible, category } = assignment;

				// Calculate grade prior to the assignment
				const priorGrade = calculateGradePercentage(
					totalPointsEarned,
					totalPointsPossible,
					pointsByCategory
				);

				// Add assignment points to the grade
				totalPointsEarned += pointsEarned;
				totalPointsPossible += pointsPossible;

				const categoryPoints = pointsByCategory[category] ?? {
					pointsEarned: 0,
					pointsPossible: 0
				};

				pointsByCategory[category] = {
					pointsEarned: categoryPoints.pointsEarned + pointsEarned,
					pointsPossible: categoryPoints.pointsPossible + pointsPossible
				};

				// Calculate grade after the assignment
				const afterGrade = calculateGradePercentage(
					totalPointsEarned,
					totalPointsPossible,
					pointsByCategory
				);

				// Calculate grade percentage change and initalize hypothetical gradebook
				const gradePercentageChange = afterGrade - priorGrade;

				return { ...assignment, gradePercentageChange };
			});
		}

		displayAssignments = [...hiddenAssignmentsInit, ...regularAssignmentsInit];
		hypotheticalAssignments = displayAssignments;
		hypotheticalGrade = calculateGradePercentage(
			totalPointsEarned,
			totalPointsPossible,
			pointsByCategory
		);
	}

	let hypotheticalMode = false;

	let hypotheticalGrade = 0;
	let rawGradeCalcMatches = true;

	// Calculate hypothetical grade and hypothetical grade percentage changes
	function calculateHypotheticalGrade(assignments: DisplayAssignment[]) {
		let pointsByCategory: {
			[categoryName: string]: { pointsEarned: number; pointsPossible: number };
		} = {};
		let totalPointsEarned = 0;
		let totalPointsPossible = 0;

		// Calculate hypothetical grade for regular assignments
		assignments = assignments
			.toReversed()
			.map((assignment) => {
				const { category, notForGrade, pointsEarned, pointsPossible } = assignment;

				if (notForGrade || isNaN(pointsEarned)) return assignment;

				// Calculate grade prior to the assignment
				const priorGrade = calculateGradePercentage(
					totalPointsEarned,
					totalPointsPossible,
					pointsByCategory
				);

				// Add assignment points to the grade
				totalPointsEarned += pointsEarned;
				totalPointsPossible += pointsPossible;

				const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
				pointsByCategory[category] = {
					pointsEarned: categoryPoints.pointsEarned + pointsEarned,
					pointsPossible: categoryPoints.pointsPossible + pointsPossible
				};

				// Calculate grade after the assignment
				const afterGrade = calculateGradePercentage(
					totalPointsEarned,
					totalPointsPossible,
					pointsByCategory
				);

				// Calculate grade percentage change and initalize hypothetical gradebook
				const gradePercentageChange = afterGrade - priorGrade;

				return { ...assignment, gradePercentageChange };
			})
			.toReversed();

		// Check if the calculated grade matches the raw grade
		if (!gradeCategories && course) {
			let rawGrade = (totalPointsEarned / totalPointsPossible) * 100;
			if (isNaN(rawGrade)) rawGrade = 0;
			let synergyGrade = parseFloat(course.Marks.Mark._CalculatedScoreRaw);

			let decimalPlaces = 0;
			if (synergyGrade % 1 != 0) decimalPlaces = synergyGrade.toString().split('.')[1].length;

			if (Math.floor(rawGrade * 10 ** decimalPlaces) / 10 ** decimalPlaces != synergyGrade)
				rawGradeCalcMatches = false;
		}

		hypotheticalAssignments = assignments;
		hypotheticalGrade = calculateGradePercentage(
			totalPointsEarned,
			totalPointsPossible,
			pointsByCategory
		);
	}

	function recalculateGradePercentage() {
		calculateHypotheticalGrade(hypotheticalAssignments);
	}

	function addHypotheticalAssignment() {
		hypotheticalAssignments = [
			{
				name: 'Hypothetical Assignment',
				pointsEarned: 0,
				pointsPossible: 0,
				gradePercentageChange: 0,
				notForGrade: false,
				hidden: false,
				hypothetical: true,
				category: 'Select category'
			},
			...hypotheticalAssignments
		];
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
					<ol class="space-y-4">
						{#each hypotheticalMode ? hypotheticalAssignments : displayAssignments as { name, pointsEarned, pointsPossible, gradePercentageChange, notForGrade, hidden, hypothetical, category, date }}
							<li>
								<Assignment
									bind:name
									bind:pointsEarned
									bind:pointsPossible
									{gradePercentageChange}
									bind:notForGrade
									{hidden}
									{hypothetical}
									bind:category
									{categoryDropdownOptions}
									{date}
									editable={hypotheticalMode}
									{recalculateGradePercentage}
								/>
							</li>
						{/each}
					</ol>
				</TabItem>

				{#each assignmentCategories as category}
					<TabItem title={category}>
						<ol class="space-y-4">
							{#each (hypotheticalMode ? hypotheticalAssignments : displayAssignments)
								.filter((assignment) => assignment.category === category)
								.map((assignment) => {
									const { category, ...rest } = assignment;
									return rest;
								}) as { name, pointsEarned, pointsPossible, gradePercentageChange, notForGrade, hidden, hypothetical, date }}
								<li>
									<Assignment
										bind:name
										bind:pointsEarned
										bind:pointsPossible
										{gradePercentageChange}
										bind:notForGrade
										{hidden}
										{hypothetical}
										bind:category
										{categoryDropdownOptions}
										{date}
										editable={hypotheticalMode}
										{recalculateGradePercentage}
									/>
								</li>
							{/each}
						</ol>
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
