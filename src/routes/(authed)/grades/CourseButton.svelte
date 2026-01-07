<script lang="ts">
	import { bgColorVariants } from '$lib';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import MapPinHouseIcon from '@lucide/svelte/icons/map-pin-house';
	import UserIcon from '@lucide/svelte/icons/user';
	import NumberFlow from '@number-flow/svelte';
	import BellElectricIcon from '@lucide/svelte/icons/bell-electric';

	interface Props {
		index: number;
		name: string;
		period: string;
		room: string;
		teacher: string;
		teacherEmail: string;
		unseenAssignmentsCount: number;
		grade?: { letter: string; percentage: number };
	}
	const { index, name, period, room, teacher, unseenAssignmentsCount, grade }: Props = $props();

	function getColorForGrade(grade: string | number) {
		if (typeof grade === 'number') {
			if (grade > 100) return 'blue';
			if (grade >= 90) return 'green';
			else if (grade >= 80) return 'yellow';
			else return 'red';
		}

		if (grade.match(/^A\+?-?$/)) return 'green';
		else if (grade.match(/^B\+?-?$/)) return 'yellow';
		else if (grade.match(/^[CDEF]\+?-?$/)) return 'red';
		return undefined;
	}

	const indicatorClass = $derived.by(() => {
		if (!grade) return undefined;

		const color = getColorForGrade(grade.letter);
		if (color === undefined) return undefined;

		return bgColorVariants[color];
	});
</script>

<Button
	href="/grades/{index.toString()}"
	variant="card"
	size="lg"
	class="flex h-auto flex-col items-stretch gap-3 rounded-xl p-4 text-xl whitespace-normal sm:flex-row sm:justify-between"
>
	<div class="flex flex-1 flex-col gap-2 self-start">
		<span class="line-clamp-1">{name}</span>

		<div class="flex flex-wrap gap-1">
			<Badge variant="secondary">
				<BellElectricIcon />
				Period {period}
			</Badge>

			<Badge variant="secondary" title="Room">
				<MapPinHouseIcon />
				{room}
			</Badge>

			<Badge variant="secondary" title="Teacher">
				<UserIcon />
				{teacher}
			</Badge>
		</div>
	</div>

	{#if grade}
		<div class="flex flex-col items-center gap-2 self-end sm:flex-row sm:self-auto">
			{#if unseenAssignmentsCount > 0}
				<Badge color="green">{unseenAssignmentsCount} new</Badge>
			{/if}

			<NumberFlow
				prefix={grade.letter + ' '}
				value={grade.percentage / 100}
				format={{ style: 'percent', maximumFractionDigits: 3 }}
				class="self-end sm:self-auto"
			/>

			<Progress
				value={Math.min(isNaN(grade.percentage) ? 0 : grade.percentage, 100)}
				class="w-48 transition-all lg:w-64"
				{indicatorClass}
			/>
		</div>
	{/if}
</Button>
