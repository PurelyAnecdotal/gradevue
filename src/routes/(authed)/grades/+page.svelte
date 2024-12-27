<script lang="ts">
	import { getColorForGrade, removeClassID } from '$lib';
	import { Alert, Button, Card, Dropdown, DropdownItem, Progressbar } from 'flowbite-svelte';
	import ChevronDownOutline from 'flowbite-svelte-icons/ChevronDownOutline.svelte';
	import ChevronUpOutline from 'flowbite-svelte-icons/ChevronUpOutline.svelte';
	import CloseCircleOutline from 'flowbite-svelte-icons/CloseCircleOutline.svelte';
	import MapPinAltOutline from 'flowbite-svelte-icons/MapPinAltOutline.svelte';
	import { gradebookState } from './gradebook.svelte';
	import { changeReportPeriod, periodOverrideState, type Period } from './reportingPeriods.svelte';

	let dropdownOpen = $state(false);

	const allPeriods: Period[] | undefined = $derived(
		gradebookState.gradebook?.ReportingPeriods.ReportPeriod.map((synergyReportPeriod) => {
			return {
				name: synergyReportPeriod._GradePeriod,
				startDate: new Date(synergyReportPeriod._StartDate),
				endDate: new Date(synergyReportPeriod._EndDate)
			};
		})
	);

	const currentPeriodIndex = $derived(
		(allPeriods ?? [])
			.map((period) => period.name)
			.findIndex((name) => name === gradebookState.gradebook?.ReportingPeriod._GradePeriod)
	);

	const currentPeriod: Period | undefined = $derived(
		gradebookState.gradebook?.ReportingPeriod
			? {
					name: gradebookState.gradebook.ReportingPeriod._GradePeriod,
					startDate: new Date(gradebookState.gradebook.ReportingPeriod._StartDate),
					endDate: new Date(gradebookState.gradebook.ReportingPeriod._EndDate)
				}
			: undefined
	);

	$effect(() => {
		if (currentPeriodIndex === -1)
			throw new Error('Could not find index of current reporting period');
	});

	async function setReportPeriodIndex(index: number) {
		if (!allPeriods || !currentPeriod) return;

		periodOverrideState.original ??= { period: currentPeriod, index: currentPeriodIndex };

		await changeReportPeriod(allPeriods[index], index);
	}
</script>

<svelte:head>
	<title>Grades - GradeVue</title>
</svelte:head>

{#if gradebookState.gradebook && allPeriods && currentPeriod}
	<main class="m-4 space-y-4">
		<div class="flex flex-col justify-center">
			<Button color="light" class="mx-auto flex items-center">
				{(periodOverrideState.new?.period ?? currentPeriod).name}

				{#if dropdownOpen}
					<ChevronUpOutline size="sm" class="ml-2 focus:outline-none" />
				{:else}
					<ChevronDownOutline size="sm" class="ml-2 focus:outline-none" />
				{/if}
			</Button>

			<Dropdown bind:open={dropdownOpen}>
				{#each allPeriods ?? [] as period, index}
					<DropdownItem
						onclick={async () => {
							dropdownOpen = false;

							await setReportPeriodIndex(index);
						}}
						class="flex items-center"
					>
						{#if period.name === currentPeriod.name}
							<MapPinAltOutline size="sm" class="mr-2" />
						{/if}
						{period.name}
					</DropdownItem>
				{/each}
			</Dropdown>
		</div>

		{#if gradebookState.gradebook.Courses.Course.map((course) => course.Marks.Mark._CalculatedScoreString).every((score) => score === 'N/A') && !periodOverrideState.new}
			<Alert class="mx-auto flex w-fit items-center" color="dark">
				<CloseCircleOutline />
				It looks like you don't have any grades yet in this reporting period.

				{#if currentPeriodIndex > 0}
					<Button
						onclick={async () => await setReportPeriodIndex(currentPeriodIndex - 1)}
						color="alternative"
						outline
					>
						<span class="text-gray-300">View {allPeriods[currentPeriodIndex - 1].name}</span>
					</Button>
				{/if}
			</Alert>
		{/if}

		<ol class="space-y-4">
			{#each gradebookState.gradebook.Courses.Course ?? [] as { _Title: title, Marks: { Mark: { _CalculatedScoreString: grade, _CalculatedScoreRaw: percent } } }, index}
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
