<script lang="ts">
	import { page } from '$app/state';
	import { getBlobURLFromBase64String } from '$lib';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';
	import type { ReportCard } from '$lib/types/ReportCard';
	import { Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	const documentGU = page.url.searchParams.get('documentGU');

	let reportCardURLPromise: Promise<string> | undefined = $state();

	onMount(async () => {
		reportCardURLPromise = new Promise(async (resolve, reject) => {
			if (!documentGU) {
				reject(new Error('DocumentGU not provided'));
				return;
			}

			if (!$studentAccount) {
				reject(new Error('Student account not loaded'));
				return;
			}

			let reportCard: ReportCard;

			try {
				reportCard = await $studentAccount.reportCard(documentGU);
			} catch {
				reject(new Error('Document not found'));
				return;
			}

			try {
				resolve(getBlobURLFromBase64String(reportCard.Base64Code));
			} catch (error) {
				reject(error);
			}
		});

		location.assign(await reportCardURLPromise);
	});
</script>

<svelte:head>
	<title>Document - GradeVue</title>
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
