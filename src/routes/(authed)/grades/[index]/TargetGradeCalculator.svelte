<script lang="ts">
	import { numberFlowDefaultEasing } from '$lib';
	import {
		calculatePointsNeededForTargetGrade,
		getCalculableAssignments,
		getCalculableAssignmentsWithCategories,
		type ReactiveAssignment,
		type TargetGradeCalculatorCategoryDependentOptions
	} from '$lib/assignments';
	import NumberInput from '$lib/components/NumberInput.svelte';
	import SquareDashedMousePointerIcon from '@lucide/svelte/icons/square-dashed-mouse-pointer';
	import SquareMousePointerIcon from '@lucide/svelte/icons/square-mouse-pointer';
	import XIcon from '@lucide/svelte/icons/x';
	import NumberFlow, { NumberFlowGroup } from '@number-flow/svelte';
	import { Button, Label, Modal, Radio } from 'flowbite-svelte';
	import { untrack } from 'svelte';
	import AssignmentCard from './AssignmentCard.svelte';

	interface Props {
		initialGradePercentage?: number;
		assignments: ReactiveAssignment[];
		onclose: () => void;
		gradeCategoryWeightProportions?: Map<string, number>;
	}

	const { assignments, initialGradePercentage, gradeCategoryWeightProportions, onclose }: Props =
		$props();

	let targetGradePercentage = $state(initialGradePercentage);
	let targetAssignment = $state<ReactiveAssignment | undefined>(undefined);

	let targetAssignmentSelectMode = $state(false);
	function toggleTargetAssignmentSelectMode() {
		targetAssignmentSelectMode = !targetAssignmentSelectMode;
	}

	$effect(() => {
		void assignments;

		untrack(() => {
			targetAssignment = assignments.find((assignment) => assignment.id === targetAssignment?.id);
		});
	});

	const categoryDependentOptions:
		| TargetGradeCalculatorCategoryDependentOptions<ReactiveAssignment>
		| undefined = $derived(
		gradeCategoryWeightProportions && targetAssignment?.category
			? {
					hasCategories: true,
					otherAssignments: getCalculableAssignmentsWithCategories(assignments).filter(
						({ id }) => id !== targetAssignment?.id
					),
					gradeCategoryWeightProportions,
					assignmentCategoryName: targetAssignment.category
				}
			: gradeCategoryWeightProportions === undefined
				? {
						hasCategories: false,
						otherAssignments: getCalculableAssignments(assignments).filter(
							({ id }) => id !== targetAssignment?.id
						)
					}
				: undefined
	);

	const targetGradePointsNeeded = $derived(
		targetGradePercentage !== undefined &&
			targetAssignment?.pointsPossible !== undefined &&
			categoryDependentOptions
			? calculatePointsNeededForTargetGrade({
					targetGradePercentage,
					assignmentPointsPossible: targetAssignment.pointsPossible,
					...categoryDependentOptions
				})
			: undefined
	);
</script>

<div class="mx-auto w-fit rounded-lg border-2 p-4 dark:border-gray-800">
	<h3 class="mb-4 flex justify-between">
		Target Grade Calculator
		<Button color="alternative" class="p-1" size="xs" onclick={onclose}>
			<XIcon />
		</Button>
	</h3>

	<div class="grid grid-flow-col grid-rows-2 gap-x-4">
		<Label for="target-grade-input" class="mb-0 block">Target grade</Label>
		<p class="flex items-center text-sm">
			<NumberInput
				bind:value={targetGradePercentage}
				type="number"
				id="target-grade-input"
				size="sm"
				class="w-20 text-right"
			/>%
		</p>

		<Label for="target-assignment-input" class="block">Target assignment</Label>
		{#if targetAssignment}
			<p class="flex items-center gap-2">
				{targetAssignment.name}
				<Button title="Select another assignment" color="light" class="p-2!">
					<SquareDashedMousePointerIcon onclick={toggleTargetAssignmentSelectMode}  class="h-4 w-4" />
				</Button>
			</p>
		{:else}
			<Button color="light" size="sm" class="w-fit flex items-center gap-2" onclick={toggleTargetAssignmentSelectMode}>
				<SquareMousePointerIcon class="h-4 w-4" />
				Select
			</Button>
		{/if}
	</div>

	{#if targetAssignment?.pointsPossible !== undefined && !(gradeCategoryWeightProportions && targetAssignment.category === undefined) && targetGradePointsNeeded !== undefined}
		<p class="mt-4 text-sm dark:text-gray-300">Required assignment grade:</p>

		<div class="mt-2 ml-auto w-fit text-lg">
			<NumberFlowGroup>
				<NumberFlow
					value={targetGradePointsNeeded}
					format={{ maximumFractionDigits: 3 }}
					spinTiming={{ duration: 400, easing: numberFlowDefaultEasing }}
					suffix="/{targetAssignment.pointsPossible} "
					class="font-bold [&::part(suffix)]:ml-[0.0625em] [&::part(suffix)]:text-sm [&::part(suffix)]:font-normal [&::part(suffix)]:text-gray-300 [&::part(suffix)]:dark:text-gray-400"
				/>
				<NumberFlow
					value={targetGradePointsNeeded / targetAssignment.pointsPossible}
					format={{ style: 'percent', maximumFractionDigits: 3 }}
					spinTiming={{ duration: 400, easing: numberFlowDefaultEasing }}
					class="font-bold"
				/>
			</NumberFlowGroup>
		</div>
	{/if}

	{#if targetAssignment && targetAssignment.pointsPossible === undefined}
		<p class="mt-4 text-sm dark:text-gray-300">
			Selected assignment is missing the "points possible" value.
		</p>
	{/if}

	{#if targetAssignment && gradeCategoryWeightProportions && targetAssignment.category === undefined}
		<p class="mt-4 text-sm dark:text-gray-300">Selected assignment is missing a category.</p>
	{/if}
</div>

<Modal
	bind:open={targetAssignmentSelectMode}
	title="Select Assignment"
	headerClass="flex items-center p-4 md:p-5 justify-between rounded-t-lg shrink-0 text-xl font-semibold text-gray-900 dark:text-white"
	size="lg"
	outsideclose={true}
>
	<p class="text-sm dark:text-gray-300">
		To use an assignment that has not yet been entered, first create it as a hypothetical
		assignment, then select it in this menu.
	</p>

	<ol class="space-y-4">
		{#each assignments as { name, pointsEarned, pointsPossible, unscaledPoints, extraCredit, notForGrade, hidden, newHypothetical, category, date, comments, id }, i (id)}
			<li>
				<Radio
					name="target-assignment"
					checked={targetAssignment?.id === id}
					onclick={() => {
						targetAssignment = assignments[i];
					}}
					class="max-w-none"
				>
					<div class="grow">
						<AssignmentCard
							{name}
							{pointsEarned}
							{pointsPossible}
							{unscaledPoints}
							{extraCredit}
							{notForGrade}
							{hidden}
							showHypotheticalLabel={newHypothetical}
							{category}
							{date}
							{comments}
						/>
					</div>
				</Radio>
			</li>
		{/each}
	</ol>
</Modal>
