<script lang="ts">
	import {
		calculateCourseGradePercentageFromCategories,
		calculateCourseGradePercentageFromTotals,
		getCalculableAssignments,
		getCalculableAssignmentsWithCategories,
		getPointsByCategory,
		type Assignment,
		type Calculable,
		type CalculableWithCategory,
		type Category
	} from '$lib/assignments';
	import type { ChartData, ChartOptions, Point } from 'chart.js';
	import { mode } from 'mode-watcher';
	import { SvelteMap } from 'svelte/reactivity';
	import LineChart from './LineChart.svelte';

	interface Props {
		assignments: Assignment[];
		gradeCategories?: Category[];
		animate: boolean;
		error?: boolean;
	}
	let { assignments, gradeCategories, animate, error = false }: Props = $props();

	interface DataPointMetadata {
		assignmentsOnDate: Assignment[];
	}

	const bgGradientColor = $derived(error ? '#d9203b44' : '#CC4522AA');
	const pointColor = $derived(error ? 'oklch(0.5701 0.2139 21.15)' : 'oklch(0.7268 0.1683 33.34)');
	const lineColor = $derived(pointColor);

	const dataPoints = $derived.by(() => {
		if (gradeCategories) {
			const assignmentsByDate: Map<number, CalculableWithCategory<Assignment>[]> = new SvelteMap();

			const calculableAssignments = getCalculableAssignmentsWithCategories(assignments);

			calculableAssignments.forEach((assignment) => {
				const ms = assignment.date.getTime();
				const existingAssignments = assignmentsByDate.get(ms) ?? [];
				assignmentsByDate.set(ms, [...existingAssignments, assignment]);
			});

			const entries = [...assignmentsByDate.entries()].toSorted(([ms_a], [ms_b]) => ms_a - ms_b);

			return entries
				.map(([ms, assignments], i) => {
					const assignmentsUntil = entries
						.map((entry) => entry[1])
						.slice(0, i + 1)
						.flat();

					const grade = calculateCourseGradePercentageFromCategories(
						getPointsByCategory(assignmentsUntil),
						gradeCategories
					);

					const metadata: DataPointMetadata = {
						assignmentsOnDate: assignments
					};

					return { x: ms, y: grade, metadata };
				})
				.filter((x) => x !== null);
		} else {
			const assignmentsByDate: Map<number, Calculable<Assignment>[]> = new SvelteMap();

			const calculableAssignments = getCalculableAssignments(assignments);

			calculableAssignments.forEach((assignment) => {
				const ms = assignment.date.getTime();
				const existingAssignments = assignmentsByDate.get(ms) ?? [];
				assignmentsByDate.set(ms, [...existingAssignments, assignment]);
			});

			const entries = [...assignmentsByDate.entries()].toSorted(([ms_a], [ms_b]) => ms_a - ms_b);

			return entries
				.map(([ms, assignments], i) => {
					const assignmentsUntil = entries
						.map((entry) => entry[1])
						.slice(0, i + 1)
						.flat();

					const grade = calculateCourseGradePercentageFromTotals(assignmentsUntil);

					const metadata: DataPointMetadata = {
						assignmentsOnDate: assignments
					};

					return { x: ms, y: grade, metadata };
				})
				.filter((x) => x !== null);
		}
	});

	const chartData: ChartData<'line', Point[], string> = $derived({
		datasets: [
			{
				data: dataPoints,
				fill: 'start',
				borderColor: lineColor,
				borderWidth: 2,
				borderDash: error ? [6, 6] : undefined,
				pointBackgroundColor: pointColor,
				pointHoverBackgroundColor: pointColor,
				pointBorderWidth: 0,
				pointHoverBorderWidth: 0,
				pointRadius: 4,
				pointHoverRadius: 8,
				pointHitRadius: 16,
				gradient: {
					backgroundColor: {
						axis: 'y',
						colors: {
							0: mode.current === 'light' ? '#FFFFFF00' : '#02061800',
							100: bgGradientColor
						}
					}
				}
			}
		]
	});

	const dayFormatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	});

	const percentFormatter = new Intl.NumberFormat('en-US', {
		style: 'percent',
		maximumFractionDigits: 3
	});

	const ticks = {
		color: mode.current === 'light' ? 'oklch(55.4% 0.046 257.417)' : 'oklch(70.4% 0.04 256.788)' // slate-500 or slate-400
	};

	const chartOptions: ChartOptions<'line'> = $derived({
		scales: {
			x: {
				// @ts-expect-error timestack is provided by chartjs-scale-timestack
				type: 'timestack',
				time: { unit: 'day' },
				grid: { display: false },
				ticks
			},
			y: {
				grid: {
					color:
						mode.current === 'light' ? 'oklch(86.9% 0.022 252.894)' : 'oklch(37.2% 0.044 257.287)' // slate-300 or slate-700
				},
				ticks,
				border: { display: false }
			}
		},
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					title: (context) => dayFormatter.format(context[0]!.parsed.x!),
					label: (context) => [
						`${percentFormatter.format(context.parsed.y! / 100)}${error ? ' (may be inaccurate)' : ''}`,
						...(context.raw as { metadata: DataPointMetadata }).metadata.assignmentsOnDate.map(
							(assignment) => assignment.name
						)
					]
				},
				displayColors: false
			}
		},
		maintainAspectRatio: false,
		parsing: false,
		normalized: true,
		animation: animate ? undefined : false
	});
</script>

<div class="m-4 h-64">
	<LineChart data={chartData} options={chartOptions} class="h-64" />
</div>
