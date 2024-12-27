<script lang="ts">
	import { page } from '$app/state';
	import { getBlobURLFromBase64String } from '$lib';
	import { acc } from '$lib/account.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import type { Attachment } from '$lib/types/Attachment';
	import { Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	const attachmentGU = page.url.searchParams.get('attachmentGU');

	let attachmentURLPromise: Promise<string> | undefined = $state();

	onMount(async () => {
		attachmentURLPromise = new Promise(async (resolve, reject) => {
			if (!attachmentGU) {
				reject(new Error('AttachmentGU not provided'));
				return;
			}

			if (!acc.studentAccount) {
				reject(new Error('Student account not loaded'));
				return;
			}

			let attachment: Attachment;

			try {
				attachment = await acc.studentAccount.attachment(attachmentGU);
			} catch {
				reject(new Error('Attachment not found'));
				return;
			}

			try {
				resolve(getBlobURLFromBase64String(attachment.Base64Code));
			} catch (error) {
				reject(error);
			}
		});

		location.assign(await attachmentURLPromise);
	});
</script>

<svelte:head>
	<title>Attachment - GradeVue</title>
</svelte:head>

{#if attachmentURLPromise}
	{#await attachmentURLPromise}
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
