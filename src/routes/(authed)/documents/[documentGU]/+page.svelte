<script lang="ts">
	import { page } from '$app/state';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';
	import { Button, Card } from 'flowbite-svelte';

	const reportCardPromise = $studentAccount?.reportCard(page.params.documentGU);

	reportCardPromise?.then((reportCard) =>
		location.assign(`data:application/pdf;base64,${reportCard.Base64Code}`)
	);
</script>

<svelte:head>
	<title>Document - GradeVue</title>
</svelte:head>

{#if reportCardPromise}
	{#await reportCardPromise}
		<LoadingBanner loadingMsg="Loading report card..." />
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
