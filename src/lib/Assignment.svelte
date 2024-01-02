<script lang="ts">
	import { Card, Badge, Progressbar, Input } from 'flowbite-svelte';
	import { getColorForGrade } from '$lib/index';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';

	export let name: string;
	export let pointsEarned: number;
	export let pointsPossible: number;
	export let category: string | undefined = undefined;
	export let date: string | undefined = undefined;
	export let hypotheticalMode = false;
	export let hidden = false;

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities/i)) return 'green';
		return 'primary';
	};

	export let hypotheticalPointsEarned = isNaN(pointsEarned) ? '' : pointsEarned.toString();
	export let hypotheticalPointsPossible = pointsPossible.toString();

	$: percentage = hypotheticalMode
		? (parseFloat(hypotheticalPointsEarned) / parseFloat(hypotheticalPointsPossible)) * 100
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
		{#if date}
			<Badge color="dark">{date}</Badge>
		{/if}
		{#if hypotheticalMode ? hypotheticalPointsEarned == '' : isNaN(pointsEarned)}
			<Badge color="dark">Not Graded</Badge>
		{/if}
		{#if hidden}
			<Badge border color="dark" class="hidden-badge">
				Hidden Assignments <InfoCircleOutline size="xs" class="ml-1" />
			</Badge>
		{/if}
	</div>

	<div class="ml-auto mr-2 shrink-0">
		{#if hypotheticalMode}
			<div class="w-32 flex items-center">
				<Input type="number" size="sm" bind:value={hypotheticalPointsEarned} />
				<span class="mx-1"> / </span>
				<Input type="number" size="sm" bind:value={hypotheticalPointsPossible} />
			</div>
		{:else if isNaN(pointsEarned)}
			{pointsPossible}
		{:else}
			{pointsEarned}/{pointsPossible}
			{Math.round(percentage * 100) / 100}%
		{/if}
	</div>
	<Progressbar
		color={getColorForGrade(percentage)}
		progress={Math.min(isNaN(percentage) ? 0 : percentage, 100)}
		animate={true}
		class="hidden sm:block w-1/3 shrink-0"
	/>
</Card>
