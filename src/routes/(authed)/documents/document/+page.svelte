<script lang="ts">
	import { page } from '$app/state';
	import { getBlobURLFromBase64String } from '$lib';
	import { acc } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import type { ReportCard } from '$lib/types/ReportCard';
	import { Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let reportCardURLPromise: Promise<string> | undefined = $state();

	const getReportCardURL = async (documentGU: string | null) => {
		if (documentGU === null) throw new Error('DocumentGU not provided');

		if (!acc.studentAccount) throw new Error('Student account not loaded');

		let reportCard: ReportCard;

		try {
			reportCard = await acc.studentAccount.reportCard(documentGU);
		} catch {
			throw new Error('Document not found');
		}

		return getBlobURLFromBase64String(reportCard.Base64Code);
	};

	onMount(async () => {
		reportCardURLPromise = getReportCardURL(page.url.searchParams.get('documentGU'));

		location.assign(await reportCardURLPromise);
	});
</script>

<svelte:head>
	<title>Document - {brand}</title>
</svelte:head>

{#if reportCardURLPromise}
	{#await reportCardURLPromise}
		<LoadingBanner loadingMsg="Loading document..." />
	{:then}
		<LoadingBanner loadingMsg="Redirecting..." />
	{:catch error}
		<div class="flex min-h-screen items-center justify-center">
			<Card class="space-y-4 text-sm leading-relaxed dark:text-gray-200">
				<h1 class="text-2xl dark:text-white">{error}</h1>

				<Button href="/documents" class="w-full">Return to Documents</Button>
			</Card>
		</div>
	{/await}
{/if}
