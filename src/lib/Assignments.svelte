<script lang="ts">
	import { Card, Badge, Progressbar } from 'flowbite-svelte';
	import type { CourseEntity } from './Gradebook';
	import { getColorForGrade } from '$lib/index';

	export let course: CourseEntity;
	export let category: string | undefined = undefined;

	$: assignments = course.Marks.Mark.Assignments.Assignment
		? course.Marks.Mark.Assignments.Assignment.filter(
				(assignment) => category === undefined || assignment._Type === category
			)
		: [];

	function extractScore(score: string): [number, number] | [number] {
		if (score.match(/ Points Possible$/))
			return [parseFloat(score.replace(/ Points Possible$/, ''))];

		const [num, denom] = score.split(' / ').map((num) => parseFloat(num));
		return [num, denom];
	}

	const calculateScore = (scores: [number, number?]) => {
		const [num, denom] = scores;
		if (!denom) return 0;
		return (num / denom) * 100;
	};

	const getCategoryColor = (category: string) => {
		if (category.match(/final/i)) return 'red';
		if (category.match(/test|quiz|assessment/i)) return 'purple';
		if (category.match(/homework|classwork|activity|activities/i)) return 'green';
		return 'primary';
	};
</script>

{#if course.Marks.Mark.Assignments.Assignment}
	<ol>
		{#each assignments as assignment}
			<li>
				<Card
					class="dark:text-white sm:p-4 mb-4 max-w-none flex flex-row justify-between items-center"
				>
					<div>
						<span class="mr-2">{assignment._Measure}</span>
						{#if !category}
							<Badge color={getCategoryColor(assignment._Type)}>
								{assignment._Type}
							</Badge>
						{/if}

						<Badge color="dark">{assignment._Date}</Badge>
					</div>

					<span class="ml-auto shrink-0">
						{#if !extractScore(assignment._Points)[1]}
							{extractScore(assignment._Points)[0]}
						{:else}
							{extractScore(assignment._Points)[0]}/{extractScore(assignment._Points)[1]}
							{Math.round(calculateScore(extractScore(assignment._Points)) * 100) / 100}%
						{/if}
					</span>
					<Progressbar
						color={getColorForGrade(calculateScore(extractScore(assignment._Points)))}
						progress={Math.min(calculateScore(extractScore(assignment._Points)), 100)}
						animate={true}
						class="hidden md:block w-1/3 shrink-0 ml-2"
					/>
				</Card>
			</li>
		{/each}
	</ol>
{/if}
