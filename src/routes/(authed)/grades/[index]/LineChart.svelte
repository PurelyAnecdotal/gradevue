<!-- inspired by https://github.com/SauravKanchan/svelte-chartjs/issues/158#issuecomment-2456212827 -->

<script lang="ts">
	import { Chart, type ChartData, type ChartOptions, type Point } from 'chart.js';
	import 'chart.js/auto';
	import 'chartjs-adapter-date-fns';
	import gradient from 'chartjs-plugin-gradient';
	import 'chartjs-scale-timestack';
	import type { HTMLCanvasAttributes } from 'svelte/elements';

	interface Props extends HTMLCanvasAttributes {
		data: ChartData<'line', number[] | Point[], string>;
		options: ChartOptions<'line'>;
	}

	const { data, options, ...rest }: Props = $props();

	let canvasElem: HTMLCanvasElement;
	let chart: Chart;

	$effect(() => {
		chart = new Chart(canvasElem, {
			type: 'line',
			data,
			options,
			plugins: [gradient]
		});

		return () => chart.destroy();
	});

	$effect(() => {
		if (chart) {
			chart.data = data;
			chart.update();
		}
	});
</script>

<canvas bind:this={canvasElem} {...rest}></canvas>
