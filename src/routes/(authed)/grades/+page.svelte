<script lang="ts">
	import { getColorForGrade, removeClassID } from '$lib/index';
	import { gradebook, gradebookLoaded, studentAccount } from '$lib/stores';
	import { Button, Card, Dropdown, DropdownItem, Progressbar } from 'flowbite-svelte';
	import { ChevronDownSolid, ChevronUpSolid, MapPinOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

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

	let greeting = '';

	onMount(() => {
		const currentTime = new Date().getHours();

		if (currentTime >= 5 && currentTime < 12) {
		greeting = 'Good morning';
		} else if (currentTime >= 12 && currentTime < 18) {
		greeting = 'Good afternoon';
		} else {
		greeting = 'Good evening';
		}
	});
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

	<ol class="space-y-4 px-8 pb-4 pt-0">
		{#each $gradebook.Courses.Course ?? [] as course, index}
		
			<li>
				<Card
					class="dark:text-white text-xl max-w-none flex flex-row justify-between items-center"
					href="/grades/{index.toString()}"
				>
				

				<div class="w-12 h-12 flex items-center justify-center bg-primary-600 rounded-full mr-4">
					<span class="text-3xl tracking-tight font-extrabold lg:text-3xl text-gray-100 dark:text-gray-100 whitespace-nowrap">{course._Period}</span>
				</div>
				<div class="flex flex-col">
					<span class="line-clamp-1 mb-1">{removeClassID(course._Title)}</span>
					<span class="line-clamp-1 text-sm">{removeClassID(course._Staff)}</span>
				</div>

				<div class="flex flex-col shrink-0 ml-auto mr-4 w-1/3">
					<span class="shrink-0 ml-auto mr-2 pb-2">
						{course.Marks.Mark._CalculatedScoreRaw}%
						({course.Marks.Mark._CalculatedScoreString})
					</span>
					<Progressbar
						color={getColorForGrade(course.Marks.Mark._CalculatedScoreString)}
						progress={course.Marks.Mark._CalculatedScoreRaw}
						animate={true}
						class="hidden sm:block w-full shrink-0"
					/>
				</div>



					
				

					
					
				</Card>
			</li>
		{/each}
	</ol>
{/if}
