<script lang="ts">
	import type { Gradebook } from '$lib/Gradebook';
	import { studentAccount } from '$lib/stores';
	import { getCache } from '$lib/cache';
	import { page } from '$app/stores';
	import type { CourseEntity } from '$lib/Gradebook';

	let gradebook: Gradebook = getCache('gradebook');
	let dataLoaded = false;

	$: course = gradebook.Courses.Course
		? gradebook.Courses.Course[parseInt($page.params.index)]
		: null;

	$studentAccount.grades().then((grades) => {
		gradebook = grades;
		dataLoaded = true;
		console.log(gradebook);

		localStorage.setItem('gradebook', JSON.stringify(gradebook));
	});
</script>

<a href="/grades">Back</a>

{#if !dataLoaded}
	Loading Grades...
{/if}

<br />

{#if course}
	{course._Title}: {course.Marks.Mark._CalculatedScoreString}
	{course.Marks.Mark._CalculatedScoreRaw}%
	{#if typeof course.Marks.Mark.GradeCalculationSummary != 'string'}
		<ul>
			{#each course.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc ?? [] as category}
				<li>
					{category._Type}: {category._CalculatedMark}
					{category._WeightedPct}/{category._Weight}
					{category._Points}/{category._PointsPossible}
				</li>
			{/each}
		</ul>
	{/if}
	{#if course.Marks.Mark.Assignments.Assignment}
		<ul>
			{#each course.Marks.Mark.Assignments.Assignment as assignment}
				<li>
					{assignment._Measure}: {assignment._Score} ({assignment._Date}, {assignment._Type})
				</li>
			{/each}
		</ul>
	{/if}
{/if}
