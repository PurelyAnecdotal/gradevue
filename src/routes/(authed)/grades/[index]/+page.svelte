<script lang="ts">
	import { page } from '$app/state';
	import { removeClassID } from '$lib';
	import {
		calculateAssignmentGPCs,
		calculateAssignmentGPCsFromCategories,
		calculateAssignmentGPCsFromTotals,
		calculateCourseGradePercentageFromCategories,
		calculateCourseGradePercentageFromTotals,
		calculateGradePercentage,
		type Category,
		type Flowed,
		getCalculableAssignments,
		getHiddenAssignmentsFromCategories,
		getPointsByCategory,
		getSynergyCourseAssignmentCategories,
		gradesMatch,
		type HiddenAssignment,
		type NewHypotheticalAssignment,
		parseSynergyAssignment,
		type ReactiveAssignment,
		type RealAssignment
	} from '$lib/assignments';
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

	const gradebookState = $derived(getCurrentGradebookState(gradebooksState));

	const synergyCourse = $derived(
		gradebookState?.data?.Courses.Course?.[parseInt(page.params.index)]
	);

	const courseName = $derived(synergyCourse ? removeClassID(synergyCourse._Title) : '');

	const synergyGradePercentage = $derived(
		parseFloat(synergyCourse?.Marks.Mark._CalculatedScoreRaw ?? '')
	);

	const categories: Category[] | undefined = $derived(
		synergyCourse ? getSynergyCourseAssignmentCategories(synergyCourse) : undefined
	);

	const gradeCategories = $derived(categories?.filter((category) => category.name !== 'TOTAL'));

	const totalCategory = $derived(categories?.find((category) => category.name === 'TOTAL'));

	const synergyAssignments = $derived(synergyCourse?.Marks.Mark.Assignments.Assignment ?? []);

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

	// Initialize reactive assignments and re-initialize them when assignments change
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		assignments;

		untrack(() => {
			reactiveAssignments = assignments.map((assignment) => {
				const reactiveAssignment: ReactiveAssignment = $state({
					...assignment,
					pointsEarned: assignment.pointsEarned,
					gradePercentageChange: assignment.gradePercentageChange,
					newHypothetical: false,
					reactive: true
				});

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
		});
	});

	function recalculateGradePercentage() {
		if (gradeCategories === undefined) {
			reactiveAssignments = calculateAssignmentGPCsFromTotals(reactiveAssignments);
		} else {
			reactiveAssignments = calculateAssignmentGPCsFromCategories(
				reactiveAssignments,
				gradeCategories
			);
		}
		const calculable = getCalculableAssignments(reactiveAssignments);

		hypotheticalGrade = gradeCategories
			? calculateCourseGradePercentageFromCategories(
					getPointsByCategory(calculable),
					gradeCategories
				)
			: calculateCourseGradePercentageFromTotals(calculable);
	}

	function addHypotheticalAssignment() {
		const newHypotheticalAssignment: NewHypotheticalAssignment = $state({
			name: 'Hypothetical Assignment',
			id: `hypothetical-${Math.random().toString()}`,
			pointsEarned: undefined,
			pointsPossible: undefined,
			unscaledPoints: undefined,
			extraCredit: false,
			gradePercentageChange: undefined,
			notForGrade: false,
			hidden: false,
			category: 'Select category',
			newHypothetical: true,
			date: undefined,
			reactive: true
		});

		reactiveAssignments = [newHypotheticalAssignment, ...reactiveAssignments];
	}

	let calcWarningOpen = $state(false);

	const prefix = $derived(
		hypotheticalMode ? '' : synergyCourse?.Marks.Mark._CalculatedScoreString + ' '
	);

	const value = $derived(
		hypotheticalMode
			? hypotheticalGrade / 100
			: synergyCourse
				? parseFloat(synergyCourse.Marks.Mark._CalculatedScoreRaw) / 100
				: undefined
	);

	// https://github.com/barvian/number-flow/blob/e9fc6999417df7cb7e7b290f7f2019f570c18cc7/packages/number-flow/src/index.ts#L73
	const easing =
		'linear(0,.005,.019,.039,.066,.096,.129,.165,.202,.24,.278,.316,.354,.39,.426,.461,.494,.526,.557,.586,.614,.64,.665,.689,.711,.731,.751,.769,.786,.802,.817,.831,.844,.856,.867,.877,.887,.896,.904,.912,.919,.925,.931,.937,.942,.947,.951,.955,.959,.962,.965,.968,.971,.973,.976,.978,.98,.981,.983,.984,.986,.987,.988,.989,.99,.991,.992,.992,.993,.994,.994,.995,.995,.996,.996,.9963,.9967,.9969,.9972,.9975,.9977,.9979,.9981,.9982,.9984,.9985,.9987,.9988,.9989,1)';

	const unseenAssignments = $derived(
		realAssignments.filter(({ id }) => !seenAssignmentIDs.has(id))
	);
</script>

<svelte:head>
	<title>{courseName} - GradeVue</title>
</svelte:head>

{#if synergyCourse}
	<div class="sticky top-0 flex justify-between rounded-b-lg bg-gray-900 p-4">
		<span class="line-clamp-1 text-2xl">
			{courseName}
		</span>
		<span class="flex shrink-0 items-center text-2xl">
			{#if hypotheticalMode && !categories && !rawGradeCalcMatches}
				<ExclamationCircleSolid class="mr-2 focus:outline-none" />
			{/if}
			{#if value}
				<NumberFlow
					{prefix}
					{value}
					format={{ style: 'percent', maximumFractionDigits: 3 }}
					spinTiming={{ duration: 400, easing }}
				/>
			{/if}
		</span>
	</div>

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
					{#each gradeCategories.toSorted() as category}
						<TableBodyRow>
							<TableBodyCell>{category.name}</TableBodyCell>
							<TableBodyCell>
								{#if category.pointsEarned !== 0 || category.pointsPossible !== 0}
									{category.gradeLetter}
									{#if rawGradeCalcMatches}
										({Math.round(
											calculateGradePercentage(category.pointsEarned, category.pointsPossible) *
												1000
										) / 1000}%)
									{/if}
								{/if}
							</TableBodyCell>
							<TableBodyCell>{category.weightPercentage}%</TableBodyCell>
							<TableBodyCell>
								{category.pointsEarned} / {category.pointsPossible}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
					<TableBodyRow>
						<TableBodyCell>Total</TableBodyCell>
						<TableBodyCell>
							{totalCategory.gradeLetter}
							{#if rawGradeCalcMatches}
								({Math.round(
									calculateGradePercentage(
										totalCategory.pointsEarned,
										totalCategory.pointsPossible
									) * 1000
								) / 1000}%)
							{/if}
						</TableBodyCell>
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
						Your class's official grade percentage does not match GradeVue's calculated grade
						percentage. This could mean that there are hidden assignments that GradeVue can't see,
						or that GradeVue isn't calculating your grade correctly. Your overall grade is still
						correct, but other things might be off.
					</span>
				{/if}
			</div>
		</Alert>
	{/if}

	{#if unseenAssignments.length > 0 && !hypotheticalMode}
		<div transition:fade={{ duration: 200 }} class="mt-4">
			<Alert color="green" border class="mx-4 flex items-center justify-between p-2 text-base">
				{unseenAssignments.length} new assignments
				<Button
					color="green"
					size="sm"
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

	<div class="flex flex-wrap items-center justify-between">
		<Checkbox bind:checked={hypotheticalMode} class="m-4">
			<div id="hypothetical-toggle" class="mr-2 flex items-center">
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
				<Button color="light" class="mx-4" onclick={addHypotheticalAssignment}>
					<GridPlusOutline size="sm" class="mr-2 focus:outline-none" />
					Add Hypothetical Assignment
				</Button>
			</div>
		{/if}
	</div>

	{#if synergyAssignments.length > 0 || hypotheticalMode}
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
										bind:extraCredit={reactiveAssignments[i].extraCredit}
										gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
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
							{#each assignments as { name, id, pointsEarned, pointsPossible, unscaledPoints, extraCredit, gradePercentageChange, notForGrade, hidden, category, date }}
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
										{category}
										{date}
										unseen={!seenAssignmentIDs.has(id)}
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
												bind:extraCredit={reactiveAssignments[i].extraCredit}
												gradePercentageChange={rawGradeCalcMatches
													? gradePercentageChange
													: undefined}
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
								{#each assignments as { name, id, pointsEarned, pointsPossible, unscaledPoints, extraCredit, gradePercentageChange, notForGrade, hidden, category, date }}
									{#if category === categoryName}
										<li>
											<AssignmentCard
												{name}
												{pointsEarned}
												{pointsPossible}
												{unscaledPoints}
												{extraCredit}
												gradePercentageChange={rawGradeCalcMatches
													? gradePercentageChange
													: undefined}
												{notForGrade}
												{hidden}
												{date}
												unseen={!seenAssignmentIDs.has(id)}
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
	{:else}
		<div class="flex justify-center">
			<Alert class="mx-4 flex w-fit items-center" color="dark">
				<CloseCircleOutline />

				Looks like this this course doesn't have any grades yet.
			</Alert>
		</div>
	{/if}
{/if}
