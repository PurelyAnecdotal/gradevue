<script lang="ts">
	import { browser } from '$app/environment';
	import { loadDocumentsList } from '$lib/cache';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { documentsList, documentsListLoaded } from '$lib/stores';
	import { Badge, Card, TabItem, Tabs } from 'flowbite-svelte';

	if (!$documentsList && browser) loadDocumentsList();

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

	let documents = $derived($documentsList?.StudentDocumentDatas?.StudentDocumentData ?? []);

	const sortPriority = ['Transcript', 'Report Card'];

	let documentCategories = $derived(new Set(
		documents
			.map((document) => document._DocumentType)
			.toSorted((a, b) => {
				const aPriority = sortPriority.indexOf(a);
				const bPriority = sortPriority.indexOf(b);
				if (aPriority == -1 && bPriority == -1) return a.localeCompare(b);
				if (aPriority == -1) return 1;
				if (bPriority == -1) return -1;
				return aPriority - bPriority;
			})
	));
</script>

<svelte:head>
	<title>Documents - GradeVue</title>
</svelte:head>

<LoadingBanner show={!$documentsListLoaded} loadingMsg="Loading documents..." />

{#if $documentsList}
	<Tabs class="m-4 mb-0" contentClass="p-4">
		<TabItem title="All" open>
			<ol class="space-y-4">
				{#each documents as document}
					<li>
						<Card
							href="/documents/{document._DocumentGU}"
							class="dark:text-white max-w-none flex flex-row items-center gap-2 flex-wrap"
						>
							<h2 class="text-md">{document._DocumentComment}</h2>
							<DateBadge date={new Date(document._DocumentDate)} />
							<Badge color={getDocumentColor(document._DocumentType)}>
								{document._DocumentType}
							</Badge>
						</Card>
					</li>
				{/each}
			</ol>
		</TabItem>
		{#each documentCategories as category}
			<TabItem title={category}>
				<ol class="space-y-4">
					{#each documents.filter((document) => document._DocumentType == category) as document}
						<li>
							<Card
								href="/documents/{document._DocumentGU}"
								class="dark:text-white max-w-none flex flex-row items-center gap-2 flex-wrap"
							>
								<h2 class="text-md">{document._DocumentComment}</h2>
								<DateBadge date={new Date(document._DocumentDate)} />
							</Card>
						</li>
					{/each}
				</ol>
			</TabItem>
		{/each}
	</Tabs>
{/if}
