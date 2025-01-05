<script lang="ts">
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import type { StudentDocumentData } from '$lib/types/Documents';
	import { Badge, Card, TabItem, Tabs } from 'flowbite-svelte';
	import { documentsState, loadDocuments } from './documents.svelte';

	loadDocuments();

	function getDocumentColor(documentType: string) {
		switch (documentType) {
			case 'Report Card':
				return 'yellow';
			case 'Transcript':
				return 'red';
			case 'MAP Growth Family Report':
				return 'blue';
			default:
				return 'primary';
		}
	}

	let documentDatas = $derived(
		documentsState.data?.StudentDocumentDatas?.StudentDocumentData ?? []
	);

	const sortPriority = ['Transcript', 'Report Card'];

	let documentCategories = $derived(
		new Set(
			documentDatas
				.map((documentData) => documentData._DocumentType)
				.toSorted((a, b) => {
					const aPriority = sortPriority.indexOf(a);
					const bPriority = sortPriority.indexOf(b);
					if (aPriority === -1 && bPriority === -1) return a.localeCompare(b);
					if (aPriority === -1) return 1;
					if (bPriority === -1) return -1;
					return aPriority - bPriority;
				})
		)
	);
</script>

<svelte:head>
	<title>Documents - GradeVue</title>
</svelte:head>

<LoadingBanner show={!documentsState.loaded} loadingMsg="Loading documents..." />

{#if documentsState.lastRefresh !== undefined}
	<RefreshIndicator
		loaded={documentsState.loaded}
		lastRefresh={documentsState.lastRefresh}
		refresh={() => loadDocuments(true)}
	/>
{/if}

{#if documentsState.data}
	<Tabs class="m-4 mb-0" contentClass="p-4">
		<TabItem title="All" open>
			{@render documentsList(documentDatas)}
		</TabItem>
		{#each documentCategories as category}
			<TabItem title={category}>
				{@render documentsList(
					documentDatas.filter((documentData) => documentData._DocumentType === category)
				)}
			</TabItem>
		{/each}
	</Tabs>
{/if}

{#snippet documentsList(documents: StudentDocumentData[])}
	<ol class="space-y-4">
		{#each documents as documentData}
			<li>
				<Card
					href="/documents/document?documentGU={documentData._DocumentGU}"
					target="_blank"
					class="flex max-w-none flex-row flex-wrap items-center gap-2 dark:text-white"
				>
					<h2 class="text-md">{documentData._DocumentComment}</h2>
					<DateBadge date={new Date(documentData._DocumentDate)} />
					<Badge color={getDocumentColor(documentData._DocumentType)}>
						{documentData._DocumentType}
					</Badge>
				</Card>
			</li>
		{/each}
	</ol>
{/snippet}
