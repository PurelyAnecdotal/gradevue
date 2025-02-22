<script lang="ts">
	import DateBadge from '$lib/components/DateBadge.svelte';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { Badge, Card } from 'flowbite-svelte';
	import UserOutline from 'flowbite-svelte-icons/UserOutline.svelte';

	interface Props {
		message: InboxItemListingsMessageXML;
	}

	let { message }: Props = $props();

	const domParser = new DOMParser();

	const doc = domParser.parseFromString(message._MessageText, 'text/html');

	let linkCount = [...doc.querySelectorAll('a')].filter(
		(link) => new URL(link.href).hostname
	).length;

	let attachments = $derived(
		typeof message.Attachments !== 'string'
			? message.Attachments.AttachmentXML instanceof Array
				? message.Attachments.AttachmentXML
				: [message.Attachments.AttachmentXML]
			: undefined
	);
</script>

<Card class="flex max-w-none flex-row justify-between gap-2 dark:text-white" padding="sm" href="#">
	<div class="flex flex-col gap-2">
		<h2 class="text-md text-left">{message._Subject}</h2>

		<div class="flex flex-row flex-wrap items-center gap-2">
			<Badge color="blue">
				<UserOutline size="xs" class="mr-1" />
				{message.From.RecipientXML._Details1} ({message.From.RecipientXML._Details2})
			</Badge>

			<DateBadge date={new Date(message._SendDateTime)} />

			{#if linkCount > 0}
				<Badge color="green">
					{linkCount}
					{linkCount === 1 ? 'Link' : 'Links'}
				</Badge>
			{/if}

			{#if attachments}
				<Badge color="indigo">
					{attachments.length}
					{attachments.length === 1 ? 'Attachment' : 'Attachments'}
				</Badge>
			{/if}
		</div>
	</div>
</Card>
