<script lang="ts">
	import {
		calculateCourseGradePercentageFromCategories,
		calculateCourseGradePercentageFromTotals,
		getCalculableAssignments,
		getPointsByCategory,
		type Assignment,
		type Calculable,
		type Category
	} from '$lib/assignments';
	import Line from '$lib/components/Line.svelte';
	import type { ChartData, ChartOptions, Point } from 'chart.js';

	interface Props {
		assignments: Assignment[];
		gradeCategories?: Category[];
		animate: boolean;
	}

	let { assignments, gradeCategories, animate }: Props = $props();

	const assignmentsByDate = $derived.by(() => {
		const map: Map<number, Calculable<Assignment>[]> = new Map();

		const calculableAssignments = getCalculableAssignments(assignments);

		calculableAssignments.forEach((assignment) => {
			const ms = assignment.date.getTime();
			const existingAssignments = map.get(ms) ?? [];
			map.set(ms, [...existingAssignments, assignment]);
		});

		return map;
	});

	interface DataPointMetadata {
		assignmentsOnDate: Assignment[];
	}

	const dataPoints = $derived.by(() => {
		const entries = [...assignmentsByDate.entries()].toSorted(([ms_a], [ms_b]) => ms_a - ms_b);

		return entries
			.map(([ms, assignments], i) => {
				const assignmentsUntil = entries
					.map((entry) => entry[1])
					.slice(0, i + 1)
					.flat();

				const grade = gradeCategories
					? calculateCourseGradePercentageFromCategories(
							getPointsByCategory(assignmentsUntil),
							gradeCategories
						)
					: calculateCourseGradePercentageFromTotals(assignmentsUntil);

				const metadata: DataPointMetadata = {
					assignmentsOnDate: assignments
				};

				return { x: ms, y: grade, metadata };
			})
			.filter((x) => x !== null);
	});

	const chartData: ChartData<'line', Point[], string> = $derived({
		datasets: [
			{
				data: dataPoints,
				fill: 'start',
				borderColor: '#FE795D',
				borderWidth: 2,
				pointBackgroundColor: '#FE795D',
				pointHoverBackgroundColor: '#FE795D',
				pointBorderWidth: 0,
				pointHoverBorderWidth: 0,
				pointRadius: 4,
				pointHoverRadius: 8,
				pointHitRadius: 16,
				gradient: {
					backgroundColor: {
						axis: 'y',
						colors: {
							0: 'transparent',
							100: '#CC4522'
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
		color: '#9ca3af' // gray-400
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
					color: '#374151' // gray-700
				},
				ticks,
				border: { display: false }
			}
		},
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					title: (context) => dayFormatter.format(context[0].parsed.x),
					label: (context) => [
						percentFormatter.format(context.parsed.y / 100),
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

<div class="h-64 bg-gray-900">
	<Line data={chartData} options={chartOptions} class="h-64" />
</div>
