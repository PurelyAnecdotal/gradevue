<script lang="ts">
	import { removeClassID } from '$lib';
	import Course from '$lib/Course.svelte';
	import { gradebook, gradebookLoaded, studentAccount } from '$lib/stores';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
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

	<ol class="space-y-4 p-4 pt-0">
		{#each $gradebook.Courses.Course ?? [] as course, index}
			<li>
				<Course
					href="/grades/{index.toString()}"
					courseName={removeClassID(course._Title)}
					scoreGrade={course.Marks.Mark._CalculatedScoreString}
					scorePercent={parseFloat(course.Marks.Mark._CalculatedScoreRaw)}
				/>
			</li>
		{/each}
	</ol>
{/if}
