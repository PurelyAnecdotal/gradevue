<script lang="ts">
	import { page } from '$app/state';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';

	const reportCardPromise = $studentAccount?.reportCard(page.params.documentGU);
</script>

<svelte:head>
	<title>Document - GradeVue</title>
</svelte:head>

{#if reportCardPromise}
	{#await reportCardPromise}
		<LoadingBanner loadingMsg="Loading report card..." />
	{:then reportCard}
		<iframe
			class="h-full w-full"
			src="data:application/pdf;base64,{reportCard.Base64Code}"
			title="Report Card PDF"
		></iframe>
	{/await}
{/if}
