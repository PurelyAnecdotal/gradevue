<script lang="ts">
	import { page } from '$app/state';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentAccount } from '$lib/stores';
	import type { Attachment } from '$lib/types/Attachment';
	import { Buffer } from 'buffer';
	import { fileTypeFromBuffer } from 'file-type';
	import { Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	const attachmentGU = page.url.searchParams.get('attachmentGU');

	let attachmentPromise: Promise<{ attachment: Attachment; mimeType: string }>;

	onMount(async () => {
		attachmentPromise = new Promise(async (resolve, reject) => {
			if (!attachmentGU) {
				reject(new Error('AttachmentGU not provided'));
				return;
			}

			if (!$studentAccount) {
				reject(new Error('Student account not loaded'));
				return;
			}

			let attachment: Attachment;

			try {
				attachment = await $studentAccount.attachment(attachmentGU);
			} catch {
				reject(new Error('Attachment not found'));
				return;
			}

			const mimeType = (
				await fileTypeFromBuffer(new Uint8Array(Buffer.from(attachment.Base64Code, 'base64')))
			)?.mime;

			if (!mimeType) {
				reject(new Error('Could not determine MIME type of attachment'));
				return;
			}

			resolve({ attachment, mimeType });
		});

		const { attachment, mimeType } = await attachmentPromise;

		location.assign(`data:${mimeType};base64,${attachment.Base64Code}`);
	});
</script>

<svelte:head>
	<title>Attachment - GradeVue</title>
</svelte:head>

{#if $studentAccount}
	{#await attachmentPromise}
		<LoadingBanner loadingMsg="Loading attachment..." />
	{:then}
		<LoadingBanner loadingMsg="Redirecting..." />
	{:catch error}
		<div class="flex min-h-screen items-center justify-center">
			<Card class="space-y-4 text-sm leading-relaxed dark:text-gray-200">
				<h1 class="text-2xl dark:text-white">{error}</h1>

				<Button href="/mail" class="w-full">Return to Mail</Button>
			</Card>
		</div>
	{/await}
{/if}
