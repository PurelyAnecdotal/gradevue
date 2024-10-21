<script lang="ts">
	import { browser } from '$app/environment';
	import { loadMail } from '$lib/cache';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { mail, mailLoaded } from '$lib/stores';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { Badge, Card, Modal } from 'flowbite-svelte';
	import { UserOutline } from 'flowbite-svelte-icons';
	import MailView from './MailView.svelte';

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
				<Card
					class="dark:text-white max-w-none flex flex-row justify-between gap-2"
					padding="sm"
					href="#"
					on:click={() => openMessage(message)}
				>
					<div class="flex flex-col gap-2">
						<h2 class="text-md">{message._Subject}</h2>
						<div class="flex flex-row items-center gap-2 flex-wrap">
							<Badge color="blue">
								<UserOutline size="xs" class="focus:outline-none mr-1" />
								{message.From.RecipientXML._Details1}
								({message.From.RecipientXML._Details2})
							</Badge>
							<DateBadge date={new Date(message._SendDateTime)} />
						</div>
					</div>
				</Card>
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
			<MailView
				message={openedMessage}
				content={openedMessageContent}
				links={openedMessageLinks}
				{touchscreen}
			/>
		</Modal>
	{/if}
{/if}
