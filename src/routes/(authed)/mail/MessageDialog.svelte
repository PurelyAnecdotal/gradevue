<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import { srcdoc } from './message';

	interface Props {
		open: boolean;
		touchscreen?: boolean;
		message: InboxItemListingsMessageXML;
		content?: string;
		links?: Set<string>;
	}

	let {
		open = $bindable(),
		touchscreen = false,
		message,
		content = '',
		links = new Set()
	}: Props = $props();

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

	const openNewTabInstruction = $derived(
		touchscreen
			? 'Tap and hold the link to open it in a new tab'
			: 'Ctrl+click or right-click the link to open it in a new tab'
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex h-[calc(100%-2rem)] w-[calc(100%-2rem)] flex-col sm:max-w-3xl">
		<Dialog.Header class="text-start">
			<Dialog.Title>{message._Subject}</Dialog.Title>

			<Dialog.Description>
				<p>{message._SendDateTimeFormattedLong}</p>

				<p>From: {from._Details1} ({from._Details2})</p>

				{#if recipients}
					{#if recipients.length > 1}
						<p>To:</p>

						<ul class="list-inside list-disc">
							{#each recipients as recipient (recipient._GU)}
								<li>{recipient._Details1} ({recipient._Details2})</li>
							{/each}
						</ul>
					{:else if recipients[0]}
						<p>To: {recipients[0]._Details1} ({recipients[0]._Details2})</p>
					{/if}
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<iframe
			srcdoc={srcdoc(content, openNewTabInstruction)}
			sandbox=""
			class="h-full bg-white"
			title="Message Content"
		></iframe>

		{#if attachments || links.size > 0}
			<Dialog.Footer class="flex-wrap sm:justify-start">
				{#each links as link (link)}
					<Button href={link} target="_blank" variant="outline" title="Link">
						<LinkIcon class="h-5 w-5 shrink-0" />
						<span class="truncate">{new URL(link).hostname}</span>
					</Button>
				{/each}

				{#each attachments ?? [] as attachment (attachment._SmAttachmentGU)}
					<Button
						href="/mail/attachment?attachmentGU={attachment._SmAttachmentGU}"
						target="_blank"
						variant="outline"
						title="Attachment"
					>
						<PaperclipIcon class="h-5 w-5 shrink-0" />
						<span class="truncate">{attachment._DocumentName}</span>
					</Button>
				{/each}
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
