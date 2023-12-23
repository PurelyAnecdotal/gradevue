<script lang="ts">
	import { Card, Progressbar } from 'flowbite-svelte';
	import { gradebook, studentAccount } from '$lib/stores';
	import { getCache } from '$lib/cache';
	import LoadingBanner from '$lib/LoadingBanner.svelte';
	import removeClassID from '$lib/removeClassId';

	let dataLoaded = false;
	if (!$gradebook) {
		$gradebook = getCache('gradebook');

		$studentAccount.grades().then((grades) => {
			$gradebook = grades;
			localStorage.setItem('gradebook', JSON.stringify(grades));

			dataLoaded = true;
		});
	} else dataLoaded = true;

	function getColorForGrade(grade: string) {
		if (!dataLoaded) return 'gray';
		if (grade.match(/^A\+?-?$/)) return 'green';
		else if (grade.match(/^B\+?-?$/)) return 'yellow';
		else if (grade.match(/^[CDEF]\+?-?$/)) return 'red';
		return 'gray';
	}
</script>

<LoadingBanner show={!dataLoaded} loadingMsg="Loading classes..." />

{#if $gradebook}
	<ol>
		{#each $gradebook.Courses.Course ?? [] as course, index}
			<li class="m-4">
				<a href="/grades/{index.toString()}">
					<Card
						padding="md"
						class="dark:text-white text-xl max-w-none flex flex-row justify-between items-center"
					>
						<span>{removeClassID(course._Title)}</span>
						<span class="text-2xl ml-auto">
							{course.Marks.Mark._CalculatedScoreString}
						</span>
						<span class="ml-2 mr-2">{course.Marks.Mark._CalculatedScoreRaw}%</span>

						<Progressbar
							color={getColorForGrade(course.Marks.Mark._CalculatedScoreString)}
							progress={course.Marks.Mark._CalculatedScoreRaw}
							animate={true}
							class="max-w-xs"
							divClass="w-full bg-gray-200 rounded-full dark:bg-gray-700 transition-colors duration-500 ease-in-out"
						/>
					</Card>
				</a>
			</li>
		{/each}
	</ol>
{/if}
