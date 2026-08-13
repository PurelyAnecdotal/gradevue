<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { gradebookState, switchReportPeriod } from '$lib/grades/catalog.svelte';
	import { getActiveGradebook } from '$lib/grades/gradebook';
	import ReportPeriodSwitcher from '../ReportPeriodSwitcher.svelte';

	const gradebookCatalog = $derived(gradebookState.gradebookCatalog);

	const gradebook = $derived(getActiveGradebook());

	const gradebookRecord = $derived(
		gradebookCatalog
			? gradebookCatalog.recordCache[
					gradebookCatalog.overrideIndex ?? gradebookCatalog.defaultIndex
				]
			: undefined
	);
</script>

<div class="m-4 flex h-full flex-col items-center gap-4">
	{#if gradebookCatalog && gradebook}
		<ReportPeriodSwitcher
			activeName={gradebook?.ReportingPeriod._GradePeriod}
			activeIndex={gradebookCatalog.overrideIndex ?? gradebookCatalog.defaultIndex}
			reportPeriods={gradebookCatalog?.canonicalReportPeriodEntries ??
				gradebook.ReportingPeriods.ReportPeriod}
			switchReportPeriod={(index) => switchReportPeriod({ overrideIndex: index })}
			hasReportPeriodCached={(index) => gradebookCatalog?.recordCache[index] !== undefined}
			disabled={gradebookCatalog?.loadingIndex !== undefined}
			defaultIndex={gradebookCatalog?.defaultIndex}
		/>
	{/if}

	{#if gradebookRecord}
		<Textarea
			value={gradebookRecord.gradebook
				? JSON.stringify(gradebookRecord.gradebook, null, 2)
				: (gradebookRecord.xml ?? '')}
			class="h-full"
		/>
	{/if}
</div>
