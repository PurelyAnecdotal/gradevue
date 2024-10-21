<script lang="ts">
	import { page } from '$app/stores';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';
	import type { Attachment } from '$lib/types/Attachment';
	import { Buffer } from 'buffer';
	import { fileTypeFromBuffer } from 'file-type';
	import { Button, Card } from 'flowbite-svelte';

	const attachmentGU = $page.url.searchParams.get('attachmentGU');

	let attachmentPromise: Promise<Attachment>;

	let mimeType: string;

	if ($studentAccount && attachmentGU) {
		attachmentPromise = $studentAccount.attachmentBase64(attachmentGU);

		attachmentPromise.then((attachment) => {
			fileTypeFromBuffer(Buffer.from(attachment.Base64Code, 'base64')).then((type) => {
				if (!type?.mime) return;

				mimeType = type.mime;
			});
		});
	}
</script>

<svelte:head>
	<title>Attachment - GradeVue</title>
</svelte:head>

{#if $studentAccount}
	{#if attachmentGU}
		{#await attachmentPromise}
			<LoadingBanner loadingMsg="Loading attachment..." />
		{:then attachment}
			<iframe
				class="w-full h-full"
				src="data:{mimeType};base64,{attachment.Base64Code}"
				title="Attachment"
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
