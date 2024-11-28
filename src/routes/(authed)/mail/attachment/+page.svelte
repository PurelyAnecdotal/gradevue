<script lang="ts">
	import { page } from '$app/stores';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';
	import type { Attachment } from '$lib/types/Attachment';
	import { Buffer } from 'buffer';
	import { fileTypeFromBuffer } from 'file-type';
	import { Button, Card } from 'flowbite-svelte';

	const attachmentGU = $page.url.searchParams.get('attachmentGU');

	let attachmentPromise:
		| Promise<{
				attachment: Attachment;
				mimeType: string;
		  }>
		| undefined = $state();

	if ($studentAccount && attachmentGU) {
		attachmentPromise = new Promise(async (resolve, reject) => {
			const attachment = await $studentAccount.attachmentBase64(attachmentGU);

			const mimeType = (await fileTypeFromBuffer(Buffer.from(attachment.Base64Code, 'base64')))
				?.mime;

			if (!mimeType) {
				reject(new Error('Could not determine MIME type of attachment'));
				return;
			}

			resolve({ attachment, mimeType });
		});
	}
</script>

<svelte:head>
	<title>Attachment - GradeVue</title>
</svelte:head>

{#if $studentAccount}
	{#if attachmentGU && attachmentPromise}
		{#await attachmentPromise}
			<LoadingBanner loadingMsg="Loading attachment..." />
		{:then { attachment, mimeType }}
			<iframe
				class="w-full h-full"
				src="data:{mimeType};base64,{attachment.Base64Code}"
				title="Attachment"
			></iframe>
		{:catch error}
			<div class="flex items-center justify-center min-h-screen">
				<Card class="text-sm dark:text-gray-200 leading-relaxed space-y-4">
					<h1 class="text-2xl dark:text-white">{error}</h1>

					<Button href="/mail" class="w-full">Return to Mail</Button>
				</Card>
			</div>
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
