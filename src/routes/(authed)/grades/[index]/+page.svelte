<script lang="ts">
	import { page } from '$app/stores';
	import { extractPoints, removeClassID } from '$lib';
	import {
		calculateAssignmentGradePercentageChanges,
		calculateCourseGradePercentageFromTotals,
		calculateGradePercentage,
		type Category,
		getHiddenAssignmentsFromCategories,
		getPointsByCategory,
		gradesMatch,
		type NewHypotheticalAssignment,
		type ReactiveAssignment,
		type RealAssignment,
		recalculateGrade
	} from '$lib/assignments';
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
		ChevronDownOutline,
		ChevronUpOutline,
		ExclamationCircleSolid,
		GridPlusOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';
	import AssignmentCard from './AssignmentCard.svelte';

	const synergyCourse = $derived($gradebook?.Courses.Course?.[parseInt($page.params.index)]);

	const courseName = $derived(synergyCourse ? removeClassID(synergyCourse._Title) : '');

	const synergyGradeCalcSummary = $derived(synergyCourse?.Marks.Mark.GradeCalculationSummary);

	const synergyGradePercentage = $derived(
		parseFloat(synergyCourse?.Marks.Mark._CalculatedScoreRaw ?? '')
	);

	const synergyCategories = $derived(
		typeof synergyGradeCalcSummary != 'string' ? synergyGradeCalcSummary?.AssignmentGradeCalc : null
	);

	const categories: Category[] | undefined = $derived(
		synergyCategories?.map((category) => ({
			name: category._Type,
			weightPercentage: parseFloat(category._Weight),
			pointsEarned: parseFloat(category._Points),
			pointsPossible: parseFloat(category._PointsPossible),
			weightedPercentage: parseFloat(category._WeightedPct),
			gradeLetter: category._CalculatedMark
		}))
	);

	const gradeCategories = $derived(categories?.filter((category) => category.name !== 'TOTAL'));

	const totalCategory = $derived(categories?.find((category) => category.name === 'TOTAL'));

	const synergyAssignments = $derived(synergyCourse?.Marks.Mark.Assignments.Assignment ?? []);

	const realAssignments = $derived(
		calculateAssignmentGradePercentageChanges(
			synergyAssignments.map((synergyAssignment) => {
				const { pointsEarned, pointsPossible } = extractPoints(synergyAssignment._Points);

				const assignment: RealAssignment = {
					name: synergyAssignment._Measure,
					pointsEarned,
					pointsPossible,
					gradePercentageChange: 0,
					notForGrade: synergyAssignment._Notes === '(Not For Grading)',
					hidden: false,
					category: synergyAssignment._Type,
					date: new Date(synergyAssignment._Date)
				};

				return assignment;
			}),
			gradeCategories
		)
	);

	const hiddenAssignments = $derived(
		categories
			? getHiddenAssignmentsFromCategories(categories, getPointsByCategory(realAssignments))
			: []
	);

	const assignments = $derived([...hiddenAssignments, ...realAssignments]);

	let hypotheticalMode = $state(false);

	let hypotheticalGrade = $state(0);
	let rawGradeCalcMatches = $derived(
		gradesMatch(calculateCourseGradePercentageFromTotals(realAssignments), synergyGradePercentage)
	);

	let reactiveAssignments: ReactiveAssignment[] = $state([]);

	$effect(() => {
		reactiveAssignments = [...hiddenAssignments, ...realAssignments].map((assignment) => {
			const reactiveAssignment: ReactiveAssignment = $state({
				...assignment,
				reactive: true,
				newHypothetical: false
			});

			return reactiveAssignment;
		});
	});

	function recalculateGradePercentage() {
		// Fix Svelte treating empty numeric inputs as "null"
		reactiveAssignments = reactiveAssignments.map((assignment) => {
			if (assignment.pointsEarned === null) assignment.pointsEarned = undefined;
			return assignment;
		});
		const recalculation = recalculateGrade(reactiveAssignments);
		reactiveAssignments = recalculation.assignments;
		hypotheticalGrade = recalculation.grade;
	}

	function addHypotheticalAssignment() {
		const newHypotheticalAssignment: NewHypotheticalAssignment = $state({
			name: 'Hypothetical Assignment',
			pointsEarned: 0,
			pointsPossible: 0,
			gradePercentageChange: 0,
			notForGrade: false,
			hidden: false,
			category: 'Select category',
			newHypothetical: true,
			reactive: true
		});

		reactiveAssignments = [newHypotheticalAssignment, ...reactiveAssignments];
	}

	$inspect(reactiveAssignments);

	let calcWarningOpen = $state(false);

	function toggleCalcWarning() {
		calcWarningOpen = !calcWarningOpen;
	}
</script>

<svelte:head>
	<title>{courseName} - GradeVue</title>
</svelte:head>

{#if synergyCourse}
	<div class="h-12 md:h-14"></div>

	{#if categories && gradeCategories && totalCategory}
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
							<TableBodyCell>{category.name}</TableBodyCell>
							<TableBodyCell
								>{category.gradeLetter} ({calculateGradePercentage(
									category.pointsEarned,
									category.pointsPossible
								)})</TableBodyCell
							>
							<TableBodyCell>{category.weightPercentage}%</TableBodyCell>
							<TableBodyCell>
								{category.pointsEarned} / {category.pointsPossible}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
					<TableBodyRow>
						<TableBodyCell>Total</TableBodyCell>
						<TableBodyCell
							>{totalCategory.gradeLetter} ({calculateGradePercentage(
								totalCategory.pointsEarned,
								totalCategory.pointsPossible
							)})</TableBodyCell
						>
						<TableBodyCell />
						<TableBodyCell>
							{totalCategory.pointsEarned} / {totalCategory.pointsPossible}
						</TableBodyCell>
					</TableBodyRow>
				</TableBody>
			</Table>
		</div>
	{/if}

	{#if !rawGradeCalcMatches}
		<Alert class="m-4" color="red" border>
			<ExclamationCircleSolid slot="icon" size="sm" class="focus:outline-none" />

			<div class="flex flex-col gap-2">
				<button class="flex items-center" onclick={toggleCalcWarning}>
					<span class="font-bold text-left">
						{#if hypotheticalMode}
							Grade calculations in Hypothetical Mode are inaccurate
						{:else}
							Grade calculation error
						{/if}
					</span>
					{#if calcWarningOpen}
						<ChevronUpOutline size="md" class="focus" />
					{:else}
						<ChevronDownOutline size="md" class="focus" />
					{/if}
				</button>

				{#if calcWarningOpen}
					<span>
						Your class's official grade percentage does not match GradeVue's calculated grade
						percentage. This could mean that there are hidden assignments that GradeVue can't see,
						or that GradeVue isn't calculating your grade correctly. Your overall grade is still
						correct, but other things might be off.
					</span>
				{/if}
			</div>
		</Alert>
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

	{#if synergyAssignments.length > 0 || hypotheticalMode}
		<Popover triggeredBy=".hidden-badge" class="max-w-md">
			Teachers can choose to have assignments hidden from the assignment list but still calculated
			toward your grade. GradeVue can reveal these assignments.
		</Popover>

		<div transition:fade={{ duration: 200 }}>
			<Tabs class="m-4 mb-0" contentClass="p-4">
				<TabItem open title="All">
					<ol class="space-y-4">
						{#if hypotheticalMode}
							{#each reactiveAssignments as { gradePercentageChange, hidden, newHypothetical, date }, i}
								<li>
									<AssignmentCard
										bind:name={reactiveAssignments[i].name}
										bind:pointsEarned={reactiveAssignments[i].pointsEarned}
										bind:pointsPossible={reactiveAssignments[i].pointsPossible}
										{gradePercentageChange}
										bind:notForGrade={reactiveAssignments[i].notForGrade}
										{hidden}
										showHypotheticalLabel={newHypothetical}
										bind:category={reactiveAssignments[i].category}
										categoryDropdownOptions={gradeCategories?.map((category) => category.name)}
										{date}
										editable={true}
										{recalculateGradePercentage}
									/>
								</li>
							{/each}
						{:else}
							{#each assignments as { name, pointsEarned, pointsPossible, gradePercentageChange, notForGrade, hidden, category, date }}
								<li>
									<AssignmentCard
										{name}
										{pointsEarned}
										{pointsPossible}
										{gradePercentageChange}
										{notForGrade}
										{hidden}
										{category}
										{date}
									/>
								</li>
							{/each}
						{/if}
					</ol>
				</TabItem>

				{#each [...new Set(realAssignments
							.map((assignment) => assignment.category)
							.toSorted())] as categoryName}
					<TabItem title={categoryName}>
						<ol class="space-y-4">
							{#if hypotheticalMode}
								{#each reactiveAssignments as { gradePercentageChange, hidden, newHypothetical, date, category: assignmentCategoryName }, i}
									{#if assignmentCategoryName === categoryName}
										<li>
											<AssignmentCard
												bind:name={reactiveAssignments[i].name}
												bind:pointsEarned={reactiveAssignments[i].pointsEarned}
												bind:pointsPossible={reactiveAssignments[i].pointsPossible}
												{gradePercentageChange}
												bind:notForGrade={reactiveAssignments[i].notForGrade}
												{hidden}
												showHypotheticalLabel={newHypothetical}
												bind:category={reactiveAssignments[i].category}
												categoryDropdownOptions={gradeCategories?.map((category) => category.name)}
												{date}
												editable={true}
												{recalculateGradePercentage}
											/>
										</li>
									{/if}
								{/each}
							{:else}
								{#each assignments as { name, pointsEarned, pointsPossible, gradePercentageChange, notForGrade, hidden, category, date }}
									{#if category === categoryName}
										<li>
											<AssignmentCard
												{name}
												{pointsEarned}
												{pointsPossible}
												{gradePercentageChange}
												{notForGrade}
												{hidden}
												{date}
											/>
										</li>
									{/if}
								{/each}
							{/if}
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
					{courseName}
				</span>
				<span class="shrink-0 text-2xl flex items-center">
					{#if hypotheticalMode}
						{#if !categories && !rawGradeCalcMatches}
							<ExclamationCircleSolid class="mr-2 focus:outline-none" />
						{/if}
						{Math.round(hypotheticalGrade * 1000) / 1000}%
					{:else}
						{synergyCourse.Marks.Mark._CalculatedScoreString}
						{synergyCourse.Marks.Mark._CalculatedScoreRaw}%
					{/if}
				</span>
			</div>
		</div>
	</div>
{/if}
