<script lang="ts">
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { Badge, Card } from 'flowbite-svelte';
	import ChevronDownOutline from 'flowbite-svelte-icons/ChevronDownOutline.svelte';
	import ChevronRightOutline from 'flowbite-svelte-icons/ChevronRightOutline.svelte';
	import LinkOutline from 'flowbite-svelte-icons/LinkOutline.svelte';
	import PaperClipOutline from 'flowbite-svelte-icons/PaperClipOutline.svelte';

	interface Props {
		touchscreen?: boolean;
		message: InboxItemListingsMessageXML;
		content?: string;
		links?: string[];
	}

	let { touchscreen = false, message, content = '', links = [] }: Props = $props();

	let from = $derived(message.From.RecipientXML);
	let recipients = $derived(
		typeof message.To !== 'string'
			? message.To.RecipientXML instanceof Array
				? message.To.RecipientXML
				: [message.To.RecipientXML]
			: undefined
	);
	let attachments = $derived(
		typeof message.Attachments !== 'string'
			? message.Attachments.AttachmentXML instanceof Array
				? message.Attachments.AttachmentXML
				: [message.Attachments.AttachmentXML]
			: undefined
	);

	let showRecipients = $state(false);
</script>

<ol>
	<li class="text-md text-white">
		{message._SendDateTimeFormattedLong}
	</li>
	<li class="text-md text-white">
		From: {from._Details1}
		({from._Details2})
	</li>

	{#if recipients}
		<li class="text-md text-white">
			{#if recipients.length > 1}
				<div class="flex gap-2">
					To:
					<button
						onclick={() => {
							showRecipients = !showRecipients;
						}}
						class="flex items-center"
					>
						<Badge color="dark">
							{recipients.length} Recipients
							{#if showRecipients}
								<ChevronDownOutline size="sm" class="focus:outline-none" />
							{:else}
								<ChevronRightOutline size="sm" class="focus:outline-none" />
							{/if}
						</Badge>
					</button>
				</div>

				{#if showRecipients}
					<ul>
						{#each recipients as recipient}
							<li>{recipient._Details1} ({recipient._Details2})</li>
						{/each}
					</ul>
				{/if}
			{:else}
				To: {recipients[0]._Details1} ({recipients[0]._Details2})
			{/if}
		</li>
	{/if}
</ol>

<iframe
	srcdoc={`
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<style>
							html {
								font-family: Inter, sans-serif;
								line-height: 1.5;
							}

							a {
								position: relative;
							}
								
							a::before {
								content: "Open the link in a new tab (${touchscreen ? 'Tap and hold' : 'Ctrl+click or right-click'})";
								position: absolute;
								bottom: calc(100% + 0.5rem);
								left: 50%;
								transform: translateX(-50%);
								background-color: #333;
								color: white;
								padding: 0.25rem;
								border-radius: 0.25rem;
								font-size: 0.8rem;
								white-space: normal;
								max-width: 12rem;
								width: max-content;
								text-align: center;
								opacity: 0;
								visibility: hidden;
								transition: opacity 0.2s;
								pointer-events: none;
							}

							a:focus::before,
							a:active::before,
							a:hover::before {
								opacity: 1;
								visibility: visible;
							}
						</style>
					</head>
					<body>
						${content}
					</body>
				</html>
			`}
	sandbox=""
	class="h-96 w-full bg-white"
	title="Message Content"
></iframe>

{#if attachments || links.length > 0}
	<ul class="flex flex-wrap gap-2">
		{#each links as link}
			<li class="max-w-full">
				<Card
					padding="xs"
					horizontal={true}
					class="flex w-fit max-w-full flex-row items-center gap-2 dark:text-white"
					href={link}
					target="_blank"
				>
					<LinkOutline size="sm" class="focus:outline-none" />
					<span class="truncate">{new URL(link).hostname}</span>
				</Card>
			</li>
		{/each}

		{#each attachments ?? [] as attachment}
			<li class="max-w-full">
				<Card
					padding="xs"
					horizontal
					class="flex w-fit max-w-full flex-row items-center gap-2 dark:text-white"
					href="/mail/attachment?attachmentGU={attachment._SmAttachmentGU}"
					target="_blank"
				>
					<PaperClipOutline size="sm" class="focus:outline-none" />
					<span class="truncate">{attachment._DocumentName}</span>
				</Card>
			</li>
		{/each}
	</ul>
{/if}
