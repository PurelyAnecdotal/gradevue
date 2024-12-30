<script lang="ts">
	import { getColorForGrade, removeClassID } from '$lib';
	import { Alert, Button, Card, Dropdown, DropdownItem, Progressbar } from 'flowbite-svelte';
	import ChevronDownOutline from 'flowbite-svelte-icons/ChevronDownOutline.svelte';
	import ChevronUpOutline from 'flowbite-svelte-icons/ChevronUpOutline.svelte';
	import CloseCircleOutline from 'flowbite-svelte-icons/CloseCircleOutline.svelte';
	import MapPinAltOutline from 'flowbite-svelte-icons/MapPinAltOutline.svelte';
	import {
		getCurrentGradebookState,
		getPeriodIndex,
		gradebooksState,
		showGradebook
	} from './gradebook.svelte';

	let dropdownOpen = $state(false);

	const currentGradebookState = $derived(getCurrentGradebookState(gradebooksState));

	const allPeriods = $derived(currentGradebookState?.data?.ReportingPeriods.ReportPeriod);

	const currentPeriod = $derived(currentGradebookState?.data?.ReportingPeriod);

	const currentPeriodIndex = $derived(
		currentPeriod && allPeriods ? getPeriodIndex(currentPeriod, allPeriods) : undefined
	);

	$effect(() => {
		if (currentPeriodIndex === -1)
			throw new Error('Could not find index of current reporting period');
	});
</script>

<svelte:head>
	<title>Grades - GradeVue</title>
</svelte:head>

{#if allPeriods && currentPeriod && currentPeriodIndex !== undefined && currentGradebookState?.data}
	<main class="m-4 space-y-4">
		<div class="flex flex-col justify-center">
			<Button color="light" class="mx-auto flex items-center">
				{currentGradebookState.data.ReportingPeriod._GradePeriod}

				{#if dropdownOpen}
					<ChevronUpOutline size="sm" class="ml-2 focus:outline-none" />
				{:else}
					<ChevronDownOutline size="sm" class="ml-2 focus:outline-none" />
				{/if}
			</Button>

			<Dropdown bind:open={dropdownOpen}>
				{#each allPeriods ?? [] as period, index}
					<DropdownItem
						onclick={() => {
							dropdownOpen = false;

							showGradebook(index);
						}}
						class="flex items-center"
					>
						{#if period._GradePeriod === currentPeriod._GradePeriod}
							<MapPinAltOutline size="sm" class="mr-2" />
						{/if}
						{period._GradePeriod}
					</DropdownItem>
				{/each}
			</Dropdown>
		</div>

		{#if currentGradebookState.data.Courses.Course.map((course) => course.Marks.Mark._CalculatedScoreString).every((score) => score === 'N/A')}
			<Alert class="mx-auto flex w-fit items-center" color="dark">
				<CloseCircleOutline />
				It looks like you don't have any grades yet in this reporting period.

				{#if currentPeriodIndex > 0}
					<Button onclick={() => showGradebook(currentPeriodIndex - 1)} color="alternative" outline>
						<span class="text-gray-300">View {allPeriods[currentPeriodIndex - 1]._GradePeriod}</span
						>
					</Button>
				{/if}
			</Alert>
		{/if}

		<ol class="space-y-4">
			{#each currentGradebookState.data.Courses.Course ?? [] as { _Title: title, Marks: { Mark: { _CalculatedScoreString: grade, _CalculatedScoreRaw: percent } } }, index}
				<li>
					<Card
						class="flex max-w-none flex-row items-center justify-between text-xl dark:text-white"
						href="/grades/{index.toString()}"
					>
						<span class="mr-2 line-clamp-1">{removeClassID(title)}</span>
						<span class="ml-auto mr-2 shrink-0">
							{grade}
							{parseFloat(percent)}%
						</span>

						<Progressbar
							color={getColorForGrade(grade)}
							progress={Math.min(isNaN(parseFloat(percent)) ? 0 : parseFloat(percent), 100)}
							animate={true}
							class="hidden w-1/3 shrink-0 sm:block"
						/>
					</Card>
				</li>
			{/each}
		</ol>
	</main>
{/if}
