<script lang="ts">
	import { Card, Badge, Progressbar, Input, Checkbox } from 'flowbite-svelte';
	import { getColorForGrade } from '$lib/index';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';
	import { hypotheticalGradebook } from './stores';

	export let name: string;
	export let pointsEarned: number;
	export let pointsPossible: number;
	export let id: string;
	export let category: string | undefined = undefined;
	export let date: string | undefined = undefined;
	export let hypotheticalMode = false;
	export let hidden = false;
	export let notForGrade = true;

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities/i)) return 'green';
		return 'primary';
	};

	$: percentage = hypotheticalMode
		? (parseFloat($hypotheticalGradebook[id][0]) / parseFloat($hypotheticalGradebook[id][1])) * 100
		: (pointsEarned / pointsPossible) * 100;
</script>

<Card class="dark:text-white max-w-none flex flex-row items-center sm:p-4">
	<div class="mr-2">
		<span>{name}</span>
		{#if category}
			<Badge color={getCategoryColor(category)}>
				{category}
			</Badge>
		{/if}
		{#if percentage == Infinity}
			<Badge border color="indigo">Extra Credit</Badge>
		{/if}
		{#if hypotheticalMode ? isNaN(parseFloat($hypotheticalGradebook[id][0])) : isNaN(pointsEarned)}
			<Badge border color="purple">Not Graded</Badge>
		{/if}
		{#if notForGrade}
			<Badge border color="pink">
				{#if hypotheticalMode}
					<Checkbox bind:checked={$hypotheticalGradebook[id][2]}>
						<span class="text-xs">Not For Grade</span>
					</Checkbox>
				{:else}
					Not For Grade
				{/if}
			</Badge>
		{/if}
		{#if hidden}
			<Badge border color="dark" class="hidden-badge">
				Hidden Assignments <InfoCircleOutline size="xs" class="ml-1" />
			</Badge>
		{/if}
		{#if date}
			<Badge color="dark">{date}</Badge>
		{/if}
	</div>

	<div class="ml-auto mr-2 shrink-0">
		{#if hypotheticalMode}
			<div class="w-32 flex items-center">
				<Input type="number" size="sm" bind:value={$hypotheticalGradebook[id][0]} />
				<span class="mx-1"> / </span>
				<Input type="number" size="sm" bind:value={$hypotheticalGradebook[id][1]} />
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
