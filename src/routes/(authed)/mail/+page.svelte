<script lang="ts">
	import { browser } from '$app/environment';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { Modal } from 'flowbite-svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import MessageCard from './MessageCard.svelte';
	import MessageView from './MessageView.svelte';
	import { loadMailData, mailDataState } from './mailData.svelte';

	loadMailData();

	let domParser: DOMParser;
	if (browser) domParser = new DOMParser();

	let messageOpen = $state(false);
	let openedMessage: InboxItemListingsMessageXML | undefined = $state(undefined);
	let openedMessageContent = $state('');
	const openedMessageLinks: SvelteSet<string> = new SvelteSet();

	let touchscreen = $state(false);

	function openMessage(message: InboxItemListingsMessageXML) {
		openedMessage = message;

		const doc = domParser.parseFromString(message._MessageText, 'text/html');

		const links = doc.querySelectorAll('a');

		openedMessageLinks.clear();

		links.forEach((link) => {
			link.setAttribute('target', '_blank');

			if (new URL(link.href).hostname) openedMessageLinks.add(link.href);
		});

		openedMessageContent = doc.body.innerHTML;

		messageOpen = true;
	}
</script>

<svelte:head>
	<title>Mail - {brand}</title>
</svelte:head>

<LoadingBanner show={!mailDataState.loaded} loadingMsg="Loading mail..." />

{#if mailDataState.lastRefresh !== undefined}
	<RefreshIndicator
		loaded={mailDataState.loaded}
		lastRefresh={mailDataState.lastRefresh}
		refresh={() => loadMailData(true)}
	/>
{/if}

{#if mailDataState.data}
	<h1 class="mx-4 text-2xl font-bold">Inbox</h1>

	<ol class="space-y-4 p-4">
		{#each mailDataState.data.InboxItemListings.MessageXML as message (message._SMMessageGU)}
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
