<script lang="ts">
	import { getColorForGrade } from '$lib';
	import { Card, Progressbar } from 'flowbite-svelte';

	interface Props {
		href: string;
		courseName: string;
		scoreGrade: string;
		scorePercent: number;
	}

	let {
		href,
		courseName,
		scoreGrade,
		scorePercent
	}: Props = $props();
</script>

<Card class="dark:text-white text-xl max-w-none flex flex-row justify-between items-center" {href}>
	<span class="line-clamp-1 mr-2">{courseName}</span>
	<span class="shrink-0 ml-auto mr-2">
		{scoreGrade}
		{scorePercent}%
	</span>

	<Progressbar
		color={getColorForGrade(scoreGrade)}
		progress={Math.min(isNaN(scorePercent) ? 0 : scorePercent, 100)}
		animate={true}
		class="hidden sm:block w-1/3 shrink-0"
	/>
</Card>
