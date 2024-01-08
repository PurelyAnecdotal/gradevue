<script lang="ts">
	import { Card, Progressbar, Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { gradebook, gradebookLoaded, studentAccount } from '$lib/stores';
	import { getColorForGrade, removeClassID } from '$lib/index';
	import { ChevronDownSolid, ChevronUpSolid, MapPinOutline } from 'flowbite-svelte-icons';

	let dropdownOpen = false;

	const showDropdown = () => {
		dropdownOpen = true;
	};

	const changeReportPeriod = async (period: number) => {
		dropdownOpen = false;

		$gradebookLoaded = false;
		$gradebook = await $studentAccount?.grades(period);
		$gradebookLoaded = true;
	};
</script>

{#if $gradebook}
	<div class="m-4 flex flex-col justify-center">
		<div class="flex justify-center">
			<Button color="light" on:click={showDropdown}>
				{$gradebook.ReportingPeriod._GradePeriod}

				{#if dropdownOpen}
					<ChevronUpSolid size="xs" class="ml-2 focus:outline-none" />
				{:else}
					<ChevronDownSolid size="xs" class="ml-2 focus:outline-none" />
				{/if}
			</Button>
		</div>

		<Dropdown bind:open={dropdownOpen}>
			{#each $gradebook.ReportingPeriods.ReportPeriod ?? [] as period, index}
				<DropdownItem on:click={() => changeReportPeriod(index)} class="flex items-center">
					{#if period._GradePeriod == $gradebook.ReportingPeriod._GradePeriod}
						<MapPinOutline size="sm" class="mr-2" />
					{/if}
					{period._GradePeriod}
				</DropdownItem>
			{/each}
		</Dropdown>
	</div>

	<ol class="space-y-4 mx-4">
		{#each $gradebook.Courses.Course ?? [] as course, index}
			<li>
				<a href="/grades/{index.toString()}">
					<Card
						padding="md"
						class="dark:text-white text-xl max-w-none flex flex-row justify-between items-center"
					>
						<span class="line-clamp-1 mr-2">{removeClassID(course._Title)}</span>
						<span class="shrink-0 ml-auto mr-2">
							{course.Marks.Mark._CalculatedScoreString}
							{course.Marks.Mark._CalculatedScoreRaw}%
						</span>

						<Progressbar
							color={getColorForGrade(course.Marks.Mark._CalculatedScoreString)}
							progress={course.Marks.Mark._CalculatedScoreRaw}
							animate={true}
							class="hidden sm:block w-1/3 shrink-0"
						/>
					</Card>
				</a>
			</li>
		{/each}
	</ol>
{/if}
