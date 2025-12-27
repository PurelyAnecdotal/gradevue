<script lang="ts">
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import { Badge, Button } from 'flowbite-svelte';

	interface Props {
		touchscreen?: boolean;
		message: InboxItemListingsMessageXML;
		content?: string;
		links?: Set<string>;
	}

	let { touchscreen = false, message, content = '', links = new Set() }: Props = $props();

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

<ol class="dark:text-white">
	<li>{message._SendDateTimeFormattedLong}</li>
	<li>From: {from._Details1} ({from._Details2})</li>

	{#if recipients}
		<li>
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
								<ChevronDownIcon class="h-4 w-4" />
							{:else}
								<ChevronRightIcon class="h-4 w-4" />
							{/if}
						</Badge>
					</button>
				</div>

				{#if showRecipients}
					<ul>
						{#each recipients as recipient (recipient._GU)}
							<li>{recipient._Details1} ({recipient._Details2})</li>
						{/each}
					</ul>
				{/if}
			{:else if recipients[0]}
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

{#if attachments || links.size > 0}
	<ul class="flex flex-wrap gap-2">
		{#each links as link (link)}
			<li class="max-w-full">
				<Button
					href={link}
					target="_blank"
					color="light"
					class="flex w-fit max-w-full items-center gap-2 px-3 text-base dark:text-white"
				>
					<LinkIcon class="h-5 w-5 shrink-0" />
					<span class="truncate">{new URL(link).hostname}</span>
				</Button>
			</li>
		{/each}

		{#each attachments ?? [] as attachment (attachment._SmAttachmentGU)}
			<li class="max-w-full">
				<Button
					href="/mail/attachment?attachmentGU={attachment._SmAttachmentGU}"
					target="_blank"
					color="light"
					class="flex w-fit max-w-full items-center gap-2 px-3 text-base dark:text-white"
				>
					<PaperclipIcon class="h-5 w-5 shrink-0" />
					<span class="truncate">{attachment._DocumentName}</span>
				</Button>
			</li>
		{/each}
	</ul>
{/if}
