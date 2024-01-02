<script lang="ts">
	import { Card, Badge, Progressbar, Popover } from 'flowbite-svelte';
	import type { AssignmentEntity } from './Gradebook';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';
	import Assignment from './Assignment.svelte';
	import { calculatePercent } from '$lib';

	export let assignments: AssignmentEntity[];
	export let showCategories = true;
	export let hiddenPointsByCategory: { [categoryName: string]: [number, number] } = {};
	export let hypotheticalMode = false;
</script>

<Popover triggeredBy="[id^='hidden-']" class="max-w-md">
	Teachers can choose to have assignments hidden from the assignment list but still calculated
	toward your grade. Gradebook can reveal these assignments.
</Popover>

<ol class="space-y-4">
	{#each Object.entries(hiddenPointsByCategory) as [categoryName, [points, pointsPossible]]}
		<li>
			<Card class="dark:text-white max-w-none flex flex-row items-center sm:p-4">
				<div class="flex items-center space-x-2">
					<span>{categoryName}</span>
					<Badge border color="dark" id="hidden-{encodeURIComponent(categoryName)}">
						Hidden Assignments <InfoCircleOutline size="xs" class="ml-1" />
					</Badge>
				</div>
				<span class="ml-auto mr-2 shrink-0">
					{points}/{pointsPossible}
				</span>
				<Progressbar
					color="gray"
					progress={Math.min(calculatePercent(`${points} / ${pointsPossible}`), 100)}
					animate={true}
					class="w-1/3 shrink-0 hidden sm:block"
				/>
			</Card>
		</li>
	{/each}

	{#each assignments as assignment}
		<li>
			<Assignment {assignment} {hypotheticalMode} showCategory={showCategories} />
		</li>
	{/each}
</ol>
