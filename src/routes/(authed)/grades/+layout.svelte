<script lang="ts">
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { Alert, Button } from 'flowbite-svelte';
	import { gradebookState, loadGradebook } from './gradebook.svelte';
	import { periodOverrideState, resetPeriodOverride } from './reportingPeriods.svelte';

	let { children } = $props();

	loadGradebook();
</script>

<LoadingBanner show={!gradebookState.loaded} loadingMsg="Loading grades..." />

{#if periodOverrideState.new}
	<Alert class="m-4 flex items-center justify-between" color="light" border>
		<span class="text-white">Viewing reporting period {periodOverrideState.new.period.name}</span>

		{#if periodOverrideState.original}
			<Button
				onclick={async () => {
					if (!periodOverrideState.original) return;

					resetPeriodOverride();

					loadGradebook();
				}}
				color="light">Return to {periodOverrideState.original.period.name}</Button
			>
		{/if}
	</Alert>
{/if}

{@render children?.()}
