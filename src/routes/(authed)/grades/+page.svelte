<script lang="ts">
	import type { Gradebook } from '$lib/Gradebook';
	import { studentAccount } from '$lib/stores';
	import { getCache } from '$lib/cache';

	let gradebook: Gradebook = getCache('gradebook');
	let dataLoaded = false;

	$studentAccount.grades().then((grades) => {
		gradebook = grades;
		dataLoaded = true;

		localStorage.setItem('gradebook', JSON.stringify(gradebook));
	});
</script>

{#if !dataLoaded}
	Loading Grades...
{/if}

{#if gradebook}
	<ul>
		{#each gradebook.Courses.Course ?? [] as course, index}
			<li>
				<a href="/grades/{index.toString()}">{course._Title}</a>: {course.Marks.Mark
					._CalculatedScoreString}
				{course.Marks.Mark._CalculatedScoreRaw}%
			</li>
		{/each}
	</ul>
{:else}
	Loading Grades
{/if}
