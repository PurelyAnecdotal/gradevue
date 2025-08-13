<script lang="ts">
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import { Alert, Button } from 'flowbite-svelte';
	import {
		getCurrentGradebookState,
		gradebooksState,
		loadGradebooks,
		showGradebook
	} from './gradebook.svelte';

	let { children } = $props();

	const currentGradebookState = $derived(getCurrentGradebookState(gradebooksState));

	const activeReportingPeriodName = $derived(
		gradebooksState.records && gradebooksState.activeIndex
			? gradebooksState.records[gradebooksState.activeIndex]?.data?.ReportingPeriod._GradePeriod
			: undefined
	);

	let loadingError: unknown = $state(undefined);

	loadGradebooks().catch((error) => {
		console.error('Error loading gradebooks:', error);
		loadingError = error;
	});

	const loadedOrError = $derived(currentGradebookState?.loaded ?? loadingError !== undefined);
</script>

<LoadingBanner show={!loadedOrError} loadingMsg="Loading grades..." />

{#if currentGradebookState?.lastRefresh !== undefined}
	<RefreshIndicator
		loaded={currentGradebookState.loaded}
		lastRefresh={currentGradebookState.lastRefresh}
		refresh={() =>
			showGradebook(gradebooksState.overrideIndex ?? gradebooksState.activeIndex, true)}
	/>
{/if}

{#if loadingError}
	<Alert color="red" class="m-4">
		An error occurred while loading grades: {loadingError instanceof Error
			? loadingError.message
			: String(loadingError)}
	</Alert>
{/if}

{#if gradebooksState.overrideIndex && gradebooksState.records && gradebooksState.activeIndex && currentGradebookState?.data}
	<Alert class="mx-4 flex items-center justify-between" color="light" border>
		<span class="text-white">
			Viewing reporting period {currentGradebookState.data.ReportingPeriod._GradePeriod}
		</span>

		<Button onclick={() => showGradebook()} color="light">
			Return to {activeReportingPeriodName}
		</Button>
	</Alert>
{/if}

{@render children?.()}
