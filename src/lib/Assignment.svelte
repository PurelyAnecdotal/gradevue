<script lang="ts">
	import DateBadge from '$lib/DateBadge.svelte';
	import { getColorForGrade } from '$lib/index';
	import { hypotheticalGradebook } from '$lib/stores';
	import {
		Badge,
		Button,
		Card,
		Checkbox,
		Dropdown,
		DropdownItem,
		Input,
		Progressbar
	} from 'flowbite-svelte';
	import { ChevronDownOutline, InfoCircleOutline } from 'flowbite-svelte-icons';
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	export let name: string;
	export let pointsEarned: number;
	export let pointsPossible: number;
	export let id: string;
	export let category: string | undefined = undefined;
	export let date: Date | undefined = undefined;
	export let hypotheticalMode = false;
	export let hidden = false;
	export let notForGrade = false;
	export let hypothetical = false;
	export let hypotheticalCategoryOptions: string[] = [];

	let categoryDropdownOpen = false;

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment|performance/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities|assignment|project/i)) return 'green';
		return 'primary';
	};

	$: percentage = hypotheticalMode
		? ($hypotheticalGradebook[id].pointsEarned / $hypotheticalGradebook[id].pointsPossible) * 100
		: (pointsEarned / pointsPossible) * 100;

	let pointsEarnedInput = writable($hypotheticalGradebook[id].pointsEarned.toString());
	let pointsPossibleInput = writable($hypotheticalGradebook[id].pointsPossible.toString());

	const earnedUnsubscribe = pointsEarnedInput.subscribe((pointsEarned) => {
		$hypotheticalGradebook[id].pointsEarned = parseFloat(pointsEarned);
	});

	const possibleUnsubscribe = pointsPossibleInput.subscribe((pointsPossible) => {
		$hypotheticalGradebook[id].pointsPossible = parseFloat(pointsPossible);
	});

	const hypotheticalUnsubscribe = hypotheticalGradebook.subscribe((gradebook) => {
		if (!gradebook[id]) {
			console.error(`Missing expected hypothetical assignment ${id} with name ${name}`);
			return;
		}

		if (gradebook[id].pointsEarned !== parseFloat($pointsEarnedInput))
			$pointsEarnedInput = gradebook[id].pointsEarned.toString();

		if (gradebook[id].pointsPossible !== parseFloat($pointsPossibleInput))
			$pointsPossibleInput = gradebook[id].pointsPossible.toString();
	});

	onDestroy(() => {
		earnedUnsubscribe();
		possibleUnsubscribe();
		hypotheticalUnsubscribe();
	});
</script>

<Card class="dark:text-white max-w-none flex flex-row items-center sm:p-4">
	<div class="mr-2">
		{#if hypotheticalMode && hypothetical}
			<Input bind:value={name} class="w-48 inline" />

			{#if hypotheticalCategoryOptions.length > 0}
				<Button color="light">
					{category ?? 'Category'}
					<ChevronDownOutline size="xs" class="ml-2 focus:outline-none" />
				</Button>

				<Dropdown bind:open={categoryDropdownOpen}>
					{#each hypotheticalCategoryOptions as category}
						<DropdownItem
							on:click={() => {
								$hypotheticalGradebook[id].category = category;
								categoryDropdownOpen = false;
							}}
						>
							{category}
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
		{#if hypotheticalMode ? isNaN($hypotheticalGradebook[id].pointsEarned) : isNaN(pointsEarned)}
			<Badge border color="purple">Not Graded</Badge>
		{/if}
		{#if notForGrade}
			<Badge border color="pink">
				{#if hypotheticalMode}
					<Checkbox bind:checked={$hypotheticalGradebook[id].notForGrade}>
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

	<div class="ml-auto mr-2 shrink-0">
		{#if hypotheticalMode}
			<div class="w-32 flex items-center">
				<Input type="number" size="sm" bind:value={$pointsEarnedInput} />
				<span class="mx-1"> / </span>
				<Input type="number" size="sm" bind:value={$pointsPossibleInput} />
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
