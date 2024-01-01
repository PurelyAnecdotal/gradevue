<script lang="ts">
	import { Card, Badge, Progressbar, Popover } from 'flowbite-svelte';
	import type { AssignmentEntity } from './Gradebook';
	import { extractPoints, getColorForGrade } from '$lib/index';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';

	export let assignments: AssignmentEntity[];
	export let category: string | undefined = undefined;
	export let hiddenPointsByCategory: { [categoryName: string]: [number, number] } = {};

	$: filteredAssignments = assignments.filter(
		(assignment) => category === undefined || assignment._Type === category
	);

	$: filteredHiddenPointsByCategory = category
		? Object.entries(hiddenPointsByCategory).filter(
				([categoryName, [points, pointsPossible]]) =>
					categoryName === category && (points > 0 || pointsPossible > 0)
			)
		: Object.entries(hiddenPointsByCategory).filter(
				([_categoryName, [points, pointsPossible]]) => points > 0 || pointsPossible > 0
			);

	const calculateScore = (score: string) => {
		const [num, denom] = extractPoints(score);
		if (!denom) return 0;
		return (num / denom) * 100;
	};

	const getScoreColor = (score: string) => getColorForGrade(calculateScore(score));

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities/i)) return 'green';
		return 'primary';
	};
</script>

<ol>
	{#each filteredHiddenPointsByCategory as [categoryName, [points, pointsPossible]]}
		<li>
			<Card
				class="dark:text-white sm:p-4 mb-4 max-w-none flex flex-row justify-between items-center"
			>
				<div>
					<span class="mr-2">{categoryName}</span>
					<Badge border color="dark" id="hidden-{encodeURIComponent(categoryName)}">
						<InfoCircleOutline size="xs" class="mr-1" /> Hidden Assignments
					</Badge>
				</div>
				<span class="ml-auto shrink-0">
					{points}/{pointsPossible}
				</span>
				<Progressbar
					color="gray"
					progress={Math.min(calculateScore(`${points} / ${pointsPossible}`), 100)}
					animate={true}
					class="hidden sm:block w-1/3 shrink-0 ml-2"
				/>
			</Card>
		</li>
	{/each}
	<Popover triggeredBy="[id^='hidden-']" class="max-w-md">
		Teachers can choose to have assignments hidden from the assignment list but still calculated
		toward your grade. Gradebook can reveal these assignments.
	</Popover>
	{#each filteredAssignments as assignment}
		<li>
			<Card
				class="dark:text-white sm:p-4 mb-4 max-w-none flex flex-row justify-between items-center"
			>
				<div>
					<span class="mr-2">{assignment._Measure}</span>
					{#if !category}
						<Badge color={getCategoryColor(assignment._Type)}>
							{assignment._Type}
						</Badge>
					{/if}

					<Badge color="dark">{assignment._Date}</Badge>
				</div>

				<span class="ml-auto shrink-0">
					{#if !extractPoints(assignment._Points)[1]}
						{extractPoints(assignment._Points)[0]}
					{:else}
						{extractPoints(assignment._Points)[0]}/{extractPoints(assignment._Points)[1]}
						{Math.round(calculateScore(assignment._Points) * 100) / 100}%
					{/if}
				</span>
				<Progressbar
					color={getScoreColor(assignment._Points)}
					progress={Math.min(calculateScore(assignment._Points), 100)}
					animate={true}
					class="hidden sm:block w-1/3 shrink-0 ml-2"
				/>
			</Card>
		</li>
	{/each}
</ol>
