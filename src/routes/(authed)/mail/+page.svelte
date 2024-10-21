<script lang="ts">
	import MessageCard from './MessageCard.svelte';

	import { browser } from '$app/environment';
	import { loadMail } from '$lib/cache';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { mail, mailLoaded } from '$lib/stores';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { Modal } from 'flowbite-svelte';
	import MessageView from './MessageView.svelte';

	if (!$mail && browser) loadMail();

	let domParser: DOMParser;
	if (browser) domParser = new DOMParser();

	let messageOpen = false;
	let openedMessage: InboxItemListingsMessageXML | undefined = undefined;
	let openedMessageContent = '';
	let openedMessageLinks: string[] = [];

	let touchscreen = false;

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

<LoadingBanner show={!$mailLoaded} loadingMsg="Loading mail..." />

<h1 class="text-2xl font-bold p-4 pb-0">Inbox</h1>

{#if $mail}
	<ol class="p-4 space-y-4">
		{#each $mail.InboxItemListings.MessageXML as message}
			<li
				on:touchend={() => {
					touchscreen = true;
				}}
			>
				<button class="w-full" on:click={() => openMessage(message)}>
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
