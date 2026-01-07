<script lang="ts">
	import DateBadge from '$lib/components/DateBadge.svelte';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import UserIcon from '@lucide/svelte/icons/user';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, type ButtonProps } from '$lib/components/ui/button';

	interface Props extends ButtonProps {
		message: InboxItemListingsMessageXML;
		onclick?: () => void;
	}
	let { message, onclick, ...props }: Props = $props();

	const domParser = new DOMParser();

	const doc = $derived(domParser.parseFromString(message._MessageText, 'text/html'));

	const linkCount = $derived(
		new Set(
			[...doc.querySelectorAll('a')].filter((a) => new URL(a.href).hostname).map((a) => a.href)
		).size
	);

	let attachments = $derived(
		typeof message.Attachments !== 'string'
			? message.Attachments.AttachmentXML instanceof Array
				? message.Attachments.AttachmentXML
				: [message.Attachments.AttachmentXML]
			: undefined
	);
</script>

<Button
	{...props}
	{onclick}
	variant="card"
	class="flex h-auto w-full flex-col items-start gap-2 overflow-hidden rounded-xl p-4"
>
	<h2 class="text-start text-lg text-wrap">{message._Subject}</h2>

	<div class="flex flex-row flex-wrap items-center gap-2">
		<Badge variant="secondary">
			<UserIcon class="mr-1 h-4 w-4" />
			{message.From.RecipientXML._Details1} ({message.From.RecipientXML._Details2})
		</Badge>

		<DateBadge date={new Date(message._SendDateTime)} />

		{#if linkCount > 0}
			<Badge color="green">
				<LinkIcon class="mr-1 h-4 w-4" />
				{linkCount}
				{linkCount === 1 ? 'Link' : 'Links'}
			</Badge>
		{/if}

		{#if attachments}
			<Badge color="indigo">
				<PaperclipIcon class="mr-1 h-4 w-4" />
				{attachments.length}
				{attachments.length === 1 ? 'Attachment' : 'Attachments'}
			</Badge>
		{/if}
	</div>
</Button>
