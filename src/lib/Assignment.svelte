<script lang="ts">
	import { Card, Badge, Progressbar, Input } from 'flowbite-svelte';
	import { calculatePercent, extractPoints, getColorForGrade } from '$lib/index';
	import type { AssignmentEntity } from './Gradebook';

	export let assignment: AssignmentEntity;
	export let showCategory = true;
	export let hypotheticalMode = false;

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities/i)) return 'green';
		return 'primary';
	};

	const [pointsEarned, pointsPossible] = extractPoints(assignment._Points);

	let hypotheticalPointsEarned = isNaN(pointsEarned) ? '' : pointsEarned.toString();
	let hypotheticalPointsPossible = pointsPossible.toString();

	$: percentage = hypotheticalMode
		? (parseFloat(hypotheticalPointsEarned) / parseFloat(hypotheticalPointsPossible)) * 100
		: (pointsEarned / pointsPossible) * 100;
</script>

<Card class="dark:text-white sm:p-4 mb-4 max-w-none flex flex-row justify-between items-center">
	<div>
		<span class="mr-2">{assignment._Measure}</span>
		{#if showCategory}
			<Badge color={getCategoryColor(assignment._Type)}>
				{assignment._Type}
			</Badge>
		{/if}

		<Badge color="dark">{assignment._Date}</Badge>

		{#if hypotheticalMode ? hypotheticalPointsEarned == '' : isNaN(pointsEarned)}
			<Badge color="dark">Not Graded</Badge>
		{/if}
	</div>

	<div class="ml-auto shrink-0">
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
		class="hidden sm:block w-1/3 shrink-0 ml-2"
	/>
</Card>
