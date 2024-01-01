<script lang="ts">
	import { Card, Badge, Progressbar, Popover } from 'flowbite-svelte';
	import type { AssignmentEntity } from './Gradebook';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';
	import Assignment from './Assignment.svelte';
	import { calculatePercent } from '$lib';

	export let assignments: AssignmentEntity[];
	export let categoryFilter: string | undefined = undefined;
	export let hiddenPointsByCategory: { [categoryName: string]: [number, number] } = {};
	export let hypotheticalMode = false;

	$: filteredAssignments = assignments.filter(
		(assignment) => categoryFilter === undefined || assignment._Type === categoryFilter
	);

	$: filteredHiddenPointsByCategory = categoryFilter
		? Object.entries(hiddenPointsByCategory).filter(
				([categoryName, [points, pointsPossible]]) =>
					categoryName === categoryFilter && (points > 0 || pointsPossible > 0)
			)
		: Object.entries(hiddenPointsByCategory).filter(
				([_categoryName, [points, pointsPossible]]) => points > 0 || pointsPossible > 0
			);
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
					progress={Math.min(calculatePercent(`${points} / ${pointsPossible}`), 100)}
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
			<Assignment {assignment} {hypotheticalMode} showCategory={!categoryFilter} />
		</li>
	{/each}
</ol>
