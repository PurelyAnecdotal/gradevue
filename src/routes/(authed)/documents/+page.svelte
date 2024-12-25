<script lang="ts">
	import { browser } from '$app/environment';
	import { loadDocuments } from '$lib/cache';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { documents, documentsLoaded } from '$lib/stores';
	import { Badge, Card, TabItem, Tabs } from 'flowbite-svelte';

	if (!$documents && browser) loadDocuments();

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

	let documentDatas = $derived($documents?.StudentDocumentDatas?.StudentDocumentData ?? []);

	const sortPriority = ['Transcript', 'Report Card'];

	let documentCategories = $derived(
		new Set(
			documentDatas
				.map((documentData) => documentData._DocumentType)
				.toSorted((a, b) => {
					const aPriority = sortPriority.indexOf(a);
					const bPriority = sortPriority.indexOf(b);
					if (aPriority == -1 && bPriority == -1) return a.localeCompare(b);
					if (aPriority == -1) return 1;
					if (bPriority == -1) return -1;
					return aPriority - bPriority;
				})
		)
	);
</script>

<svelte:head>
	<title>Documents - GradeVue</title>
</svelte:head>

<LoadingBanner show={!$documentsLoaded} loadingMsg="Loading documents..." />

{#if $documents}
	<Tabs class="m-4 mb-0" contentClass="p-4">
		<TabItem title="All" open>
			<ol class="space-y-4">
				{#each documentDatas as documentData}
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
		</TabItem>
		{#each documentCategories as category}
			<TabItem title={category}>
				<ol class="space-y-4">
					{#each documentDatas.filter((documentData) => documentData._DocumentType === category) as documentData}
						<li>
							<Card
								href="/documents/document?documentGU={documentData._DocumentGU}"
								target="_blank"
								class="flex max-w-none flex-row flex-wrap items-center gap-2 dark:text-white"
							>
								<h2 class="text-md">{documentData._DocumentComment}</h2>
								<DateBadge date={new Date(documentData._DocumentDate)} />
							</Card>
						</li>
					{/each}
				</ol>
			</TabItem>
		{/each}
	</Tabs>
{/if}
