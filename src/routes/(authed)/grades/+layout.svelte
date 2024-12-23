<script lang="ts">
	import { browser } from '$app/environment';
	import { loadGradebook } from '$lib/cache';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { gradebook, gradebookLoaded } from '$lib/stores';
	import { Alert, Button } from 'flowbite-svelte';
	import { changeReportPeriod, periodState } from './reportingPeriods.svelte';

	let { children } = $props();

	if (!$gradebook && browser) loadGradebook();
</script>

<LoadingBanner show={!$gradebookLoaded} loadingMsg="Loading grades..." />

{#if periodState.new && periodState.original}
	<Alert class="m-4 flex justify-between items-center" color="light" border>
		Temporarily viewing reporting period {periodState.new.name}

		<Button
			onclick={async () => {
				if (!periodState.original) return;

				await changeReportPeriod(periodState.original.period, periodState.original.index);
				periodState.new = undefined;
			}}
			color="light">Return to {periodState.original.period.name}</Button
		>
	</Alert>
{/if}

{@render children?.()}
