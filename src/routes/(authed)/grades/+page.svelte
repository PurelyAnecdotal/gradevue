<script lang="ts">
	import { Card, Progressbar } from 'flowbite-svelte';
	import { gradebook, studentAccount } from '$lib/stores';
	import { getCache } from '$lib/cache';
	import LoadingBanner from '$lib/LoadingBanner.svelte';
	import { getColorForGrade, removeClassID } from '$lib/index';

	let dataLoaded = false;
	if (!$gradebook) {
		$gradebook = getCache('gradebook');

		$studentAccount.grades().then((grades) => {
			$gradebook = grades;
			localStorage.setItem('gradebook', JSON.stringify(grades));

			dataLoaded = true;
		});
	} else dataLoaded = true;
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
						<span class="line-clamp-1 mr-2">{removeClassID(course._Title)}</span>
						<span class="shrink-0 ml-auto mr-2">
							{course.Marks.Mark._CalculatedScoreString}
							{course.Marks.Mark._CalculatedScoreRaw}%
						</span>

						<Progressbar
							color={!dataLoaded
								? 'gray'
								: getColorForGrade(course.Marks.Mark._CalculatedScoreString)}
							progress={course.Marks.Mark._CalculatedScoreRaw}
							animate={true}
							class="hidden sm:block w-1/3"
						/>
					</Card>
				</a>
			</li>
		{/each}
	</ol>
{/if}
