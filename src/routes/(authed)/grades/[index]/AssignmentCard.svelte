<script lang="ts">
	import { getColorForGrade } from '$lib';
	import { calculateGradePercentage } from '$lib/assignments';
	import { brand } from '$lib/brand';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import NumberInput from '$lib/components/NumberInput.svelte';
	import CustomPopover from '$lib/components/Popover.svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import InfoIcon from '@lucide/svelte/icons/info';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import {
		Badge,
		Button,
		Card,
		Checkbox,
		Dropdown,
		DropdownItem,
		Input,
		Popover,
		Progressbar
	} from 'flowbite-svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		name: string;
		pointsEarned?: number;
		pointsPossible?: number;
		unscaledPoints?: { pointsEarned: number; pointsPossible: number };
		extraCredit?: boolean;
		gradePercentageChange?: number;
		notForGrade?: boolean;
		hidden?: boolean;
		showHypotheticalLabel?: boolean;
		category?: string | undefined;
		categoryDropdownOptions?: string[];
		date?: Date | undefined;
		editable?: boolean;
		unseen?: boolean;
		comments?: string;
		recalculateGradePercentage?: () => void;
	}

	let {
		name = $bindable(),
		pointsEarned = $bindable(),
		pointsPossible = $bindable(),
		unscaledPoints = $bindable(),
		extraCredit = $bindable(false),
		gradePercentageChange,
		notForGrade = $bindable(false),
		hidden = false,
		showHypotheticalLabel = false,
		category = $bindable(undefined),
		categoryDropdownOptions = [],
		date = undefined,
		editable = false,
		unseen = false,
		comments = undefined,
		recalculateGradePercentage = () => {}
	}: Props = $props();

	let categoryDropdownOpen = $state(false);

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment|performance/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities|assignment|project/i))
			return 'green';
		return 'primary';
	};

	// For assignments with a zero, show the progress bar as full to allow you to see the red color
	const isZero = $derived(pointsEarned === 0 && pointsPossible !== undefined && pointsPossible > 0);

	const percentage = $derived(
		pointsEarned !== undefined && pointsPossible !== undefined
			? calculateGradePercentage(pointsEarned, pointsPossible)
			: 0
	);

	const percentageChange = $derived(Math.round((gradePercentageChange ?? 0) * 100) / 100);

	const border = $derived(unseen ? 'dark:border-l-green-600 border-l-4' : '');

	let commentsVisible = $state(false);
	const toggleComments = () => {
		commentsVisible = !commentsVisible;
	};

	let commentsContainer: HTMLDivElement | undefined = $state();

	function handleClick(event: MouseEvent) {
		if (
			commentsVisible &&
			event.target &&
			event.target instanceof Node &&
			commentsContainer &&
			!commentsContainer.contains(event.target)
		)
			commentsVisible = false;
	}
</script>

<svelte:window onclick={handleClick} />

<Card
	class="flex max-w-none flex-row items-center transition duration-500 sm:p-4 dark:text-white {border}"
>
	<div class="mr-2">
		{#if editable}
			<Input bind:value={name} class="inline w-48" />

			{#if categoryDropdownOptions.length > 0}
				<Button color="light">
					{category ?? 'Select category'}
					{#if categoryDropdownOpen}
						<ChevronUpIcon class="ml-2 h-4 w-4" />
					{:else}
						<ChevronDownIcon class="ml-2 h-4 w-4" />
					{/if}
				</Button>

				<Dropdown bind:open={categoryDropdownOpen}>
					{#each categoryDropdownOptions as categoryOption (categoryOption)}
						<DropdownItem
							onclick={() => {
								category = categoryOption;
								categoryDropdownOpen = false;
								recalculateGradePercentage();
							}}
						>
							{categoryOption}
						</DropdownItem>
					{/each}
				</Dropdown>
			{/if}
		{:else}
			<span>{name}</span>
		{/if}
		{#if category !== undefined && (!editable || categoryDropdownOptions.length === 0)}
			<Badge color={getCategoryColor(category)}>
				{category}
			</Badge>
		{/if}
		{#if unscaledPoints}
			<Badge border color="dark">Scaled</Badge>
		{/if}
		{#if pointsEarned === undefined}
			<Badge border color="purple">Not Graded</Badge>
		{/if}
		{#if notForGrade}
			<Badge border color="pink">
				{#if editable}
					<Checkbox bind:checked={notForGrade} onchange={recalculateGradePercentage}>
						<span class="text-xs">Not For Grade</span>
					</Checkbox>
				{:else}
					Not For Grade
				{/if}
			</Badge>
		{/if}
		{#if extraCredit}
			<Badge border color="indigo">
				{#if editable}
					<Checkbox bind:checked={extraCredit} onchange={recalculateGradePercentage}>
						<span class="text-xs">Extra Credit</span>
					</Checkbox>
				{:else}
					Extra Credit
				{/if}
			</Badge>
		{/if}
		{#if hidden}
			<Popover triggeredBy=".hidden-badge" class="max-w-md">
				Teachers can choose to have assignments hidden from the assignment list but still calculated
				toward your grade. {brand} can reveal these assignments.
			</Popover>
			<Badge border color="dark" class="hidden-badge">
				Hidden Assignments <InfoIcon class="ml-1 h-4 w-4" />
			</Badge>
		{/if}
		{#if showHypotheticalLabel}
			<Badge border color="dark">Hypothetical</Badge>
		{/if}
		{#if date}
			<DateBadge {date} />
		{/if}
		{#if unseen}
			<Badge border color="green">New</Badge>
		{/if}
	</div>

	<div class="mr-2 ml-auto flex shrink-0 items-center gap-2">
		{#if comments !== undefined}
			<div class="relative" bind:this={commentsContainer}>
				<button
					onclick={toggleComments}
					title="Teacher comments"
					class="cursor-pointer rounded-lg p-2 text-sm transition-colors select-none hover:bg-slate-600 {commentsVisible
						? 'bg-slate-600'
						: 'bg-slate-700'}"
				>
					<MessageCircleIcon class="h-4 w-4"/>
				</button>

				{#if commentsVisible}
					<div
						class="absolute bottom-full left-1/2 mb-2 w-fit -translate-x-1/2"
						transition:fade={{ duration: 100 }}
					>
						<CustomPopover>{comments}</CustomPopover>
					</div>
				{/if}
			</div>
		{/if}

		{#if gradePercentageChange !== undefined}
			{#if percentageChange < 0}
				<span class="text-red-500">
					{percentageChange}%
				</span>
			{:else if percentageChange > 0}
				<span class="text-green-500">
					+{percentageChange}%
				</span>
			{:else if !notForGrade && pointsEarned !== undefined && !isNaN(pointsEarned)}
				<span class="text-gray-500">+0%</span>
			{/if}
		{/if}

		{#if unscaledPoints}
			<span class="text-gray-400">
				({unscaledPoints.pointsEarned}/{unscaledPoints.pointsPossible})
			</span>
		{/if}

		{#if editable}
			<div class="flex w-32 items-center">
				<NumberInput
					title="Points earned"
					type="number"
					size="sm"
					bind:value={pointsEarned}
					oninput={recalculateGradePercentage}
				/>
				<span class="mx-1"> / </span>
				<NumberInput
					title="Points possible"
					type="number"
					size="sm"
					bind:value={pointsPossible}
					oninput={recalculateGradePercentage}
				/>
			</div>
		{:else if pointsEarned === undefined}
			{pointsPossible}
		{:else}
			{pointsEarned}/{pointsPossible}
			{#if percentage && percentage !== Infinity}
				{Math.round(percentage * 100) / 100}%
			{/if}
		{/if}
	</div>

	{#if pointsEarned !== undefined || editable}
		<Progressbar
			color={extraCredit ? 'blue' : getColorForGrade(percentage)}
			progress={isZero ? 100 : Math.min(percentage, 100)}
			animate={true}
			class="hidden w-1/3 shrink-0 sm:block"
		/>
	{/if}
</Card>
