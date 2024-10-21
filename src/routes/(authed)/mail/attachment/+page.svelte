<script lang="ts">
	import { page } from '$app/stores';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';
	import { Button, Card } from 'flowbite-svelte';

	const attachmentGU = $page.url.searchParams.get('attachmentGU');
</script>

<svelte:head>
	<title>Attachment - GradeVue</title>
</svelte:head>

{#if $studentAccount}
	{#if attachmentGU}
		{#await $studentAccount.attachmentBase64(attachmentGU)}
			<LoadingBanner loadingMsg="Loading attachment..." />
		{:then attachment}
			<iframe
				class="w-full h-full"
				src="data:application/pdf;base64,{attachment.Base64Code}"
				title="Report Card PDF"
			/>
		{/await}
	{:else}
		<div class="flex items-center justify-center min-h-screen">
			<Card class="text-sm dark:text-gray-200 leading-relaxed space-y-4">
				<h1 class="text-2xl dark:text-white">AttachmentGU Required</h1>

				<Button href="/mail" class="w-full">Return to Mail</Button>
			</Card>
		</div>
	{/if}
{/if}
