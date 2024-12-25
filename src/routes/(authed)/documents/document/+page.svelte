<script lang="ts">
	import { page } from '$app/state';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';
	import type { ReportCard } from '$lib/types/ReportCard';
	import { Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let reportCardPromise: Promise<ReportCard>;

	const documentGU = page.url.searchParams.get('documentGU');

	onMount(async () => {
		reportCardPromise = new Promise(async (resolve, reject) => {
			if (!documentGU) {
				reject(new Error('DocumentGU not provided'));
				return;
			}

			if (!$studentAccount) {
				reject(new Error('Student account not loaded'));
				return;
			}

			try {
				resolve(await $studentAccount.reportCard(documentGU));
			} catch {
				reject(new Error('Document not found'));
				return;
			}
		});

		const reportCard = await reportCardPromise;

		location.assign(`data:application/pdf;base64,${reportCard.Base64Code}`);
	});
</script>

<svelte:head>
	<title>Document - GradeVue</title>
</svelte:head>

{#if reportCardPromise}
	{#await reportCardPromise}
		<LoadingBanner loadingMsg="Loading document..." />
	{:then}
		<LoadingBanner loadingMsg="Redirecting..." />
	{:catch error}
		<div class="flex min-h-screen items-center justify-center">
			<Card class="space-y-4 text-sm leading-relaxed dark:text-gray-200">
				<h1 class="text-2xl dark:text-white">{error}</h1>

				<Button href="/documents" class="w-full">Return</Button>
			</Card>
		</div>
	{/await}
{/if}
