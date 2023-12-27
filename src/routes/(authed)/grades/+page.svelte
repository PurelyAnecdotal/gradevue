<script lang="ts">
	import { Card, Progressbar } from 'flowbite-svelte';
	import { gradebook, gradebookLoaded } from '$lib/stores';
	import { loadGradebook } from '$lib/cache';
	import { getColorForGrade, removeClassID } from '$lib/index';
</script>

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
							color={!$gradebookLoaded
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
