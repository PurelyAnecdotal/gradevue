<script lang="ts">
	import { browser } from '$app/environment';
	import { loadMail } from '$lib/cache';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { mail, mailLoaded } from '$lib/stores';
	import { Badge, Card } from 'flowbite-svelte';
	import { UserOutline } from 'flowbite-svelte-icons';

	if (!$mail && browser) loadMail();

	$: console.log($mail?.InboxItemListings.MessageXML);
</script>

<svelte:head>
	<title>Messages - GradeVue</title>
</svelte:head>

<LoadingBanner show={!$mailLoaded} loadingMsg="Loading mail..." />

{#if $mail}
	<ol class="p-4 space-y-4">
		{#each $mail.InboxItemListings.MessageXML as message}
			<li>
				<Card class="dark:text-white max-w-none flex flex-row justify-between gap-2">
					<div class="flex flex-col gap-2">
						<h2 class="text-xl">{message._Subject}</h2>
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
{/if}
