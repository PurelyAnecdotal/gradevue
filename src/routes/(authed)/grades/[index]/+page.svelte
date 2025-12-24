<script lang="ts">
	import { page } from '$app/state';
	import { numberFlowDefaultEasing, removeClassID } from '$lib';
	import {
		type Assignment,
		calculateAssignmentGPCs,
		calculateAssignmentGPCsFromCategories,
		calculateAssignmentGPCsFromTotals,
		calculateCourseGradePercentageFromCategories,
		calculateCourseGradePercentageFromTotals,
		calculateGradePercentage,
		type Category,
		type Flowed,
		getCalculableAssignments,
		getCalculableAssignmentsWithCategories,
		getHiddenAssignmentsFromCategories,
		getPointsByCategory,
		getPointsByCategoryMap,
		getSynergyCourseAssignmentCategories,
		gradesMatch,
		type HiddenAssignment,
		type NewHypotheticalAssignment,
		parseSynergyAssignment,
		randomAssignmentID,
		type ReactiveAssignment,
		type RealAssignment
	} from '$lib/assignments';
	import { brand } from '$lib/brand';
	import NumberFlow from '@number-flow/svelte';
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
	import AddColumnAfterOutline from 'flowbite-svelte-icons/AddColumnAfterOutline.svelte';
	import ChevronDownOutline from 'flowbite-svelte-icons/ChevronDownOutline.svelte';
	import ChevronUpOutline from 'flowbite-svelte-icons/ChevronUpOutline.svelte';
	import CloseCircleOutline from 'flowbite-svelte-icons/CloseCircleOutline.svelte';
	import ExclamationCircleSolid from 'flowbite-svelte-icons/ExclamationCircleSolid.svelte';
	import GridPlusOutline from 'flowbite-svelte-icons/GridPlusOutline.svelte';
	import InfoCircleOutline from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		getCurrentGradebookState,
		gradebooksState,
		saveSeenAssignments,
		seenAssignmentIDs
	} from '../gradebook.svelte';
	import AssignmentCard from './AssignmentCard.svelte';
	import GradeChart from './GradeChart.svelte';
	import TargetGradeCalculator from './TargetGradeCalculator.svelte';

	const gradebookState = $derived(getCurrentGradebookState(gradebooksState));

	const synergyCourse = $derived(
		page.params.index !== undefined
			? gradebookState?.data?.Courses.Course?.[parseInt(page.params.index)]
			: undefined
	);

	const mark = $derived(synergyCourse?.Marks !== '' ? synergyCourse?.Marks.Mark : undefined);

	const courseName = $derived(synergyCourse ? removeClassID(synergyCourse._Title) : '');

	const synergyGradePercentage = $derived(parseFloat(mark?._CalculatedScoreRaw ?? ''));

	const categories: Category[] | undefined = $derived(
		synergyCourse ? getSynergyCourseAssignmentCategories(synergyCourse) : undefined
	);

	const gradeCategories = $derived(categories?.filter((category) => category.name !== 'TOTAL'));

	const totalCategory = $derived(categories?.find((category) => category.name === 'TOTAL'));

	const synergyAssignments = $derived(mark?.Assignments.Assignment ?? []);

	const realAssignments = $derived(
		calculateAssignmentGPCs(synergyAssignments.map(parseSynergyAssignment), gradeCategories)
	);

	const hiddenAssignments = $derived(
		categories
			? getHiddenAssignmentsFromCategories(
					categories,
					getPointsByCategory(getCalculableAssignments(realAssignments))
				)
			: []
	);

	const assignments: (RealAssignment | Flowed<RealAssignment | HiddenAssignment>)[] = $derived([
		...hiddenAssignments,
		...realAssignments
	]);

	let hypotheticalMode = $state(false);

	let calculatedGrade = $state(NaN);
	let hypotheticalGrade = $state(NaN);
	let rawGradeCalcMatches = $derived(gradesMatch(calculatedGrade, synergyGradePercentage));

	let reactiveAssignments: ReactiveAssignment[] = $state([]);

	function initReactiveAssignments() {
		reactiveAssignments = assignments.map((assignment) => {
			const reactiveAssignment: ReactiveAssignment = $state({ ...assignment, reactive: true });

			return reactiveAssignment;
		});

		const calculable = getCalculableAssignments(assignments);

		calculatedGrade = gradeCategories
			? calculateCourseGradePercentageFromCategories(
					getPointsByCategory(calculable),
					gradeCategories
				)
			: calculateCourseGradePercentageFromTotals(calculable);

		hypotheticalGrade = calculatedGrade;

		showTargetGradeCalculator = false;
	}

	// Initialize reactive assignments and re-initialize them when assignments change
	$effect(() => {
		void assignments;

		untrack(initReactiveAssignments);
	});

	function recalculateGradePercentage() {
		if (gradeCategories === undefined) {
			reactiveAssignments = calculateAssignmentGPCsFromTotals(reactiveAssignments);

			const calculable = getCalculableAssignments(reactiveAssignments);

			hypotheticalGrade = calculateCourseGradePercentageFromTotals(calculable);
		} else {
			reactiveAssignments = calculateAssignmentGPCsFromCategories(
				reactiveAssignments,
				gradeCategories
			);

			const calculable = getCalculableAssignmentsWithCategories(reactiveAssignments);

			hypotheticalGrade = calculateCourseGradePercentageFromCategories(
				getPointsByCategory(calculable),
				gradeCategories
			);
		}
	}

	const pointsByCategory = $derived(
		getPointsByCategoryMap(getCalculableAssignmentsWithCategories(reactiveAssignments))
	);

	const categoryGradePercentages = $derived(
		new Map(
			pointsByCategory
				.entries()
				.map(([categoryName, { pointsEarned, pointsPossible }]) => [
					categoryName,
					calculateGradePercentage(pointsEarned, pointsPossible)
				])
		)
	);

	function addHypotheticalAssignment() {
		const newHypotheticalAssignment: NewHypotheticalAssignment = $state({
			name: 'Hypothetical Assignment',
			id: randomAssignmentID(),
			pointsEarned: undefined,
			pointsPossible: undefined,
			unscaledPoints: undefined,
			extraCredit: false,
			gradePercentageChange: undefined,
			notForGrade: false,
			hidden: false,
			category: undefined,
			newHypothetical: true,
			date: new Date(),
			reactive: true
		});

		reactiveAssignments = [newHypotheticalAssignment, ...reactiveAssignments];
	}

	let calcWarningOpen = $state(false);

	const prefix = $derived(hypotheticalMode ? '' : mark?._CalculatedScoreString + ' ');

	const grade = $derived(
		hypotheticalMode
			? hypotheticalGrade / 100
			: mark
				? parseFloat(mark._CalculatedScoreRaw) / 100
				: undefined
	);
	const unseenAssignments = $derived(
		realAssignments.filter(({ id }) => !seenAssignmentIDs.has(id))
	);

	let pinChart = $state(false);

	let showTargetGradeCalculator = $state(false);
	function toggleTargetGradeCalculator() {
		showTargetGradeCalculator = !showTargetGradeCalculator;
	}
	const gradeCategoryWeightProportions: Map<string, number> | undefined = $derived(
		gradeCategories
			? new Map(gradeCategories.map(({ name, weightPercentage }) => [name, weightPercentage / 100]))
			: undefined
	);

	const roundedGradePercentage = $derived(
		grade !== undefined ? Math.round(grade * 100 * 1000) / 1000 : undefined
	);
</script>

<svelte:head>
	<title>{courseName} - {brand}</title>
</svelte:head>

{#if synergyCourse}
	<div class="sticky top-0">
		<div class="flex justify-between rounded-b-lg bg-gray-900 p-4">
			<span class="line-clamp-1 text-2xl">
				{courseName}
			</span>
			<span class="flex shrink-0 items-center text-2xl">
				{#if hypotheticalMode && !categories && !rawGradeCalcMatches}
					<ExclamationCircleSolid class="mr-2" />
				{/if}
				{#if grade !== undefined}
					<NumberFlow
						{prefix}
						value={grade}
						format={{ style: 'percent', maximumFractionDigits: 3 }}
						spinTiming={{ duration: 400, easing: numberFlowDefaultEasing }}
					/>
				{/if}
			</span>
		</div>
		{#if pinChart}
			{@render chart()}
		{/if}
	</div>

	{#if !pinChart}
		{@render chart()}
	{/if}

	{#snippet chart()}
		{#if rawGradeCalcMatches}
			<GradeChart
				assignments={hypotheticalMode ? reactiveAssignments : realAssignments}
				{gradeCategories}
				animate={!hypotheticalMode}
			/>
		{/if}
	{/snippet}

	{#if categories && gradeCategories && totalCategory}
		<div class="sm:mx-4">
			<Table shadow divClass="overflow-x-auto">
				<TableHead>
					<TableHeadCell>Category</TableHeadCell>
					<TableHeadCell>Grade</TableHeadCell>
					<TableHeadCell>Weight</TableHeadCell>
					<TableHeadCell>Points</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each gradeCategories.toSorted() as category (category.name)}
						<TableBodyRow>
							<TableBodyCell>{category.name}</TableBodyCell>
							<TableBodyCell>
								{#if category.pointsEarned !== 0 || category.pointsPossible !== 0}
									{#if !hypotheticalMode}
										{category.gradeLetter}
									{/if}
									{#if rawGradeCalcMatches && (!hypotheticalMode || categoryGradePercentages.has(category.name))}
										({Math.round(
											(hypotheticalMode
												? categoryGradePercentages.get(category.name)!
												: calculateGradePercentage(
														category.pointsEarned,
														category.pointsPossible
													)) * 1000
										) / 1000}%)
									{/if}
								{/if}
							</TableBodyCell>
							<TableBodyCell>{category.weightPercentage}%</TableBodyCell>
							<TableBodyCell>
								{#if hypotheticalMode}
									{pointsByCategory?.get(category.name)?.pointsEarned}
									/
									{pointsByCategory?.get(category.name)?.pointsPossible}
								{:else}
									{category.pointsEarned} / {category.pointsPossible}
								{/if}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}

	{#if !rawGradeCalcMatches}
		<Alert class="m-4" color="red" border>
			<ExclamationCircleSolid slot="icon" size="sm" />

			<div class="flex flex-col gap-2">
				<button
					class="flex items-center"
					onclick={() => {
						calcWarningOpen = !calcWarningOpen;
					}}
				>
					<span class="text-left font-bold">
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
						Your class's official grade percentage does not match {brand}'s calculated grade
						percentage. This could mean that there are hidden assignments that {brand} can't see, or that
						{brand} isn't calculating your grade correctly. Your overall grade is still correct, but other
						things might be off.
					</span>
				{/if}
			</div>
		</Alert>
	{/if}

	<div class="m-4 flex flex-wrap items-center gap-2">
		<Checkbox bind:checked={hypotheticalMode}>
			<div id="hypothetical-toggle" class="mr-2 flex items-center">
				Hypothetical Mode
				<InfoCircleOutline size="sm" class="ml-2" />
			</div>
		</Checkbox>
		<Popover triggeredBy="#hypothetical-toggle" class="max-w-md text-sm dark:text-gray-300">
			Hypothetical mode allows you to see what your grade would be if you got a certain score on an
			assignment.
		</Popover>

		{#if rawGradeCalcMatches}
			<Checkbox bind:checked={pinChart}>Pin chart when scrolling</Checkbox>
		{/if}

		{#if hypotheticalMode}
			<div transition:fade={{ duration: 200 }} class="ml-auto">
				<Button color="light" size="sm" onclick={initReactiveAssignments}>
					<CloseCircleOutline size="sm" class="mr-2" />
					Reset
				</Button>

				{#if !showTargetGradeCalculator}
					<Button color="light" size="sm" onclick={toggleTargetGradeCalculator}>
						<AddColumnAfterOutline size="sm" class="mr-2" />
						Target Grade Calculator
					</Button>
				{/if}

				<Button color="light" size="sm" onclick={addHypotheticalAssignment}>
					<GridPlusOutline size="sm" class="mr-2" />
					Add Hypothetical Assignment
				</Button>
			</div>
		{/if}
	</div>

	{#if hypotheticalMode && showTargetGradeCalculator}
		<TargetGradeCalculator
			initialGradePercentage={roundedGradePercentage}
			assignments={reactiveAssignments}
			{gradeCategoryWeightProportions}
			onclose={toggleTargetGradeCalculator}
		/>
	{/if}

	{#if synergyAssignments.length > 0 || hypotheticalMode}
		<div transition:fade={{ duration: 200 }}>
			<Tabs class="m-4 mb-0" contentClass="p-4">
				<TabItem open title="All">
					{@render assignmentList()}
				</TabItem>

				{#each [...new Set(realAssignments
							.map((assignment) => assignment.category)
							.toSorted())] as categoryName (categoryName)}
					<TabItem title={categoryName}>
						{@render assignmentList((assignment) => assignment.category === categoryName, false)}
					</TabItem>
				{/each}
			</Tabs>
		</div>
	{:else}
		<div class="flex justify-center">
			<Alert class="mx-4 flex w-fit items-center" color="dark">
				<CloseCircleOutline />

				Looks like this this course doesn't have any grades yet.
			</Alert>
		</div>
	{/if}

	{#if unseenAssignments.length > 0 && !hypotheticalMode}
		<div transition:fade={{ duration: 200 }} class="sticky bottom-8 flex justify-center">
			<Alert
				color="gray"
				border
				class="mx-4 flex w-fit items-center justify-between border p-2 pl-3 text-base shadow-lg/30 dark:border-gray-600"
			>
				{unseenAssignments.length} new assignments
				<Button
					color="green"
					size="sm"
					outline
					class="cursor-pointer"
					onclick={() => {
						unseenAssignments.forEach(({ id }) => seenAssignmentIDs.add(id));
						saveSeenAssignments();
					}}
				>
					Mark as seen
				</Button>
			</Alert>
		</div>
	{/if}
{/if}

{#snippet assignmentList(filter?: (assignment: Assignment) => boolean, showCategory = true)}
	<ol class="space-y-4">
		{#if hypotheticalMode}
			{#each reactiveAssignments as assignment, i (assignment.id)}
				{#if (!filter || filter(assignment)) && reactiveAssignments[i]}
					{@render boundAssignmentSnippet(assignment, reactiveAssignments, i, showCategory)}
				{/if}
			{/each}
		{:else}
			{#each assignments as assignment (assignment.id)}
				{#if !filter || filter(assignment)}
					{@render assignmentSnippet(assignment, showCategory)}
				{/if}
			{/each}
		{/if}
	</ol>
{/snippet}

{#snippet assignmentSnippet(
	{
		name,
		id,
		pointsEarned,
		pointsPossible,
		unscaledPoints,
		extraCredit,
		gradePercentageChange,
		notForGrade,
		hidden,
		category,
		comments,
		date,
		newHypothetical
	}: RealAssignment | Flowed,
	showCategory = true
)}
	<li>
		<AssignmentCard
			{name}
			{pointsEarned}
			{pointsPossible}
			{unscaledPoints}
			{extraCredit}
			gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
			{notForGrade}
			{hidden}
			showHypotheticalLabel={newHypothetical}
			category={showCategory ? category : undefined}
			{date}
			{comments}
			unseen={id !== undefined ? !seenAssignmentIDs.has(id) : false}
		/>
	</li>
{/snippet}

{#snippet boundAssignmentSnippet(
	{ gradePercentageChange, hidden, newHypothetical, date, comments }: ReactiveAssignment,
	reactiveAssignments: ReactiveAssignment[],
	i: number,
	showCategory = true
)}
	{#if reactiveAssignments[i]}
		<li>
			{#if showCategory}
				<AssignmentCard
					bind:name={reactiveAssignments[i].name}
					bind:pointsEarned={reactiveAssignments[i].pointsEarned}
					bind:pointsPossible={reactiveAssignments[i].pointsPossible}
					bind:extraCredit={reactiveAssignments[i].extraCredit}
					gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
					bind:notForGrade={reactiveAssignments[i].notForGrade}
					{hidden}
					showHypotheticalLabel={newHypothetical}
					bind:category={reactiveAssignments[i].category}
					categoryDropdownOptions={gradeCategories?.map((category) => category.name)}
					{date}
					{comments}
					editable={true}
					{recalculateGradePercentage}
				/>
			{:else}
				<AssignmentCard
					bind:name={reactiveAssignments[i].name}
					bind:pointsEarned={reactiveAssignments[i].pointsEarned}
					bind:pointsPossible={reactiveAssignments[i].pointsPossible}
					bind:extraCredit={reactiveAssignments[i].extraCredit}
					gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
					bind:notForGrade={reactiveAssignments[i].notForGrade}
					{hidden}
					showHypotheticalLabel={newHypothetical}
					categoryDropdownOptions={gradeCategories?.map((category) => category.name)}
					{date}
					{comments}
					editable={true}
					{recalculateGradePercentage}
				/>
			{/if}
		</li>
	{/if}
{/snippet}
