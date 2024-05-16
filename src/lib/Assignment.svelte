<script lang="ts">
	import DateBadge from '$lib/DateBadge.svelte';
	import { getColorForGrade } from '$lib/index';
	import {
		Badge,
		Button,
		Card,
		Checkbox,
		Dropdown,
		DropdownItem,
		Input,
		NumberInput,
		Progressbar
	} from 'flowbite-svelte';
	import { ChevronDownOutline, InfoCircleOutline } from 'flowbite-svelte-icons';

	export let name: string;
	export let pointsEarned: number;
	export let pointsPossible: number;
	export let gradePercentageChange: number;
	export let notForGrade = false;
	export let hidden = false;
	export let hypothetical = false;
	export let category: string | undefined = undefined;
	export let categoryDropdownOptions: string[] = [];
	export let date: Date | undefined = undefined;
	export let editable = false;
	export let recalculateGradePercentage: () => void;

	let categoryDropdownOpen = false;

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment|performance/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities|assignment|project/i))
			return 'green';
		return 'primary';
	};

	$: percentage = (pointsEarned / pointsPossible) * 100;

	$: percentageChange = Math.round(gradePercentageChange * 100) / 100;
</script>

<Card class="dark:text-white max-w-none flex flex-row items-center sm:p-4">
	<div class="mr-2">
		{#if editable && hypothetical}
			<Input bind:value={name} class="w-48 inline" />

			{#if categoryDropdownOptions.length > 0}
				<Button color="light">
					{category ?? 'Category'}
					<ChevronDownOutline size="xs" class="ml-2 focus:outline-none" />
				</Button>

				<Dropdown bind:open={categoryDropdownOpen}>
					{#each categoryDropdownOptions as categoryOption}
						<DropdownItem
							on:click={() => {
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
		{#if category && !hypothetical}
			<Badge color={getCategoryColor(category)}>
				{category}
			</Badge>
		{/if}
		{#if percentage == Infinity}
			<Badge border color="indigo">Extra Credit</Badge>
		{/if}
		{#if isNaN(pointsEarned)}
			<Badge border color="purple">Not Graded</Badge>
		{/if}
		{#if notForGrade}
			<Badge border color="pink">
				{#if editable}
					<Checkbox bind:checked={notForGrade} on:change={recalculateGradePercentage}>
						<span class="text-xs">Not For Grade</span>
					</Checkbox>
				{:else}
					Not For Grade
				{/if}
			</Badge>
		{/if}
		{#if hidden}
			<Badge border color="dark" class="hidden-badge">
				Hidden Assignments <InfoCircleOutline size="xs" class="ml-1 focus:outline-none" />
			</Badge>
		{/if}
		{#if hypothetical && name != 'Hypothetical Assignment'}
			<Badge border color="dark">Hypothetical Assignment</Badge>
		{/if}
		{#if date}
			<DateBadge {date} />
		{/if}
	</div>

	<div class="ml-auto mr-2 shrink-0 flex items-center gap-2">
		{#if percentageChange < 0}
			<span class="text-red-500">
				{percentageChange}%
			</span>
		{:else if percentageChange > 0}
			<span class="text-green-500">
				+{percentageChange}%
			</span>
		{:else if !notForGrade && !isNaN(pointsEarned)}
			<span class="text-gray-500">+0%</span>
		{/if}

		{#if editable}
			<div class="w-32 flex items-center">
				<NumberInput type="number" size="sm" bind:value={pointsEarned} on:input={recalculateGradePercentage}/>
				<span class="mx-1"> / </span>
				<NumberInput type="number" size="sm" bind:value={pointsPossible} on:input={recalculateGradePercentage} />
			</div>
		{:else if isNaN(pointsEarned)}
			{pointsPossible}
		{:else}
			{pointsEarned}/{pointsPossible}
			{#if percentage != Infinity}
				{Math.round(percentage * 100) / 100}%
			{/if}
		{/if}
	</div>

	<Progressbar
		color={getColorForGrade(percentage)}
		progress={Math.min(isNaN(percentage) ? 0 : percentage, 100)}
		animate={true}
		class="hidden sm:block w-1/3 shrink-0"
	/>
</Card>
