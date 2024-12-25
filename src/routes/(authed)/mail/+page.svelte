<script lang="ts">
	import { browser } from '$app/environment';
	import { loadMailData } from '$lib/cache';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { mailData, mailDataLoaded } from '$lib/stores';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { Modal } from 'flowbite-svelte';
	import MessageCard from './MessageCard.svelte';
	import MessageView from './MessageView.svelte';

	if (!$mailData && browser) loadMailData();

	let domParser: DOMParser;
	if (browser) domParser = new DOMParser();

	let messageOpen = $state(false);
	let openedMessage: InboxItemListingsMessageXML | undefined = $state(undefined);
	let openedMessageContent = $state('');
	let openedMessageLinks: string[] = $state([]);

	let touchscreen = $state(false);

	function openMessage(message: InboxItemListingsMessageXML) {
		openedMessage = message;

		const doc = domParser.parseFromString(message._MessageText, 'text/html');

		const links = doc.querySelectorAll('a');

		openedMessageLinks = [];

		links.forEach((link) => {
			link.setAttribute('target', '_blank');

			if (new URL(link.href).hostname) openedMessageLinks.push(link.href);
		});

		openedMessageContent = doc.body.innerHTML;

		messageOpen = true;
	}
</script>

<svelte:head>
	<title>Mail - GradeVue</title>
</svelte:head>

<LoadingBanner show={!$mailDataLoaded} loadingMsg="Loading mail..." />

<h1 class="p-4 pb-0 text-2xl font-bold">Inbox</h1>

{#if $mailData}
	<ol class="space-y-4 p-4">
		{#each $mailData.InboxItemListings.MessageXML as message}
			<li
				ontouchend={() => {
					touchscreen = true;
				}}
			>
				<button class="w-full" onclick={() => openMessage(message)}>
					<MessageCard {message} />
				</button>
			</li>
		{/each}
	</ol>

	{#if openedMessage}
		<Modal
			bind:open={messageOpen}
			title={openedMessage._Subject}
			classHeader="dark:text-white"
			size="lg"
			outsideclose
		>
			<MessageView
				message={openedMessage}
				content={openedMessageContent}
				links={openedMessageLinks}
				{touchscreen}
			/>
		</Modal>
	{/if}
{/if}
