<script lang="ts">
	import { page } from '$app/state';
	import { getBlobURLFromBase64String } from '$lib';
	import { acc } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import type { Attachment } from '$lib/types/Attachment';
	import { Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let attachmentURLPromise: Promise<string> | undefined = $state();

	const getAttachmentURL = async (attachmentGU: string | null) => {
		if (attachmentGU === null) throw new Error('AttachmentGU not provided');

		if (!acc.studentAccount) throw new Error('Student account not loaded');

		let attachment: Attachment;

		try {
			attachment = await acc.studentAccount.attachment(attachmentGU);
		} catch {
			throw new Error('Attachment not found');
		}

		return getBlobURLFromBase64String(attachment.Base64Code);
	};

	onMount(async () => {
		attachmentURLPromise = getAttachmentURL(page.url.searchParams.get('attachmentGU'));

		location.assign(await attachmentURLPromise);
	});
</script>

<svelte:head>
	<title>Attachment - {brand}</title>
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
