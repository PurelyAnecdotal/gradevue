<script lang="ts">
	import DateBadge from '$lib/DateBadge.svelte';
	import LoadingBanner from '$lib/LoadingBanner.svelte';
	import { loadDocumentsList } from '$lib/cache';
	import { documentsList, documentsListLoaded } from '$lib/stores';
	import { Card, Badge } from 'flowbite-svelte';

	if (!$documentsList) loadDocumentsList();

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
</script>

<LoadingBanner show={!$documentsListLoaded} loadingMsg="Loading documents..." />

{#if $documentsList}
	<ol class="m-4 space-y-4">
		{#each $documentsList.StudentDocumentDatas?.StudentDocumentData ?? [] as document}
			<li>
				<Card
					href="/documents/{document._DocumentGU}"
					class="dark:text-white max-w-none flex flex-row items-center gap-2 flex-wrap"
				>
					<h2 class="text-md">{document._DocumentComment}</h2>
					<DateBadge date={new Date(document._DocumentDate)} />
					<Badge color={getDocumentColor(document._DocumentType)}>{document._DocumentType}</Badge>
				</Card>
			</li>
		{/each}
	</ol>
{/if}
