<script lang="ts">
	import { browser } from '$app/environment';
	import { loadMessages } from '$lib/cache';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { messages, messagesLoaded } from '$lib/stores';
	import { Badge, Card } from 'flowbite-svelte';
	import { UserOutline } from 'flowbite-svelte-icons';

	if (!$messages && browser) loadMessages();
</script>

<LoadingBanner show={!$messagesLoaded} loadingMsg="Loading messages..." />

{#if $messages}
	<ol class="p-4 space-y-4">
		{#each $messages as message}
			<li>
				<Card class="dark:text-white max-w-none flex flex-row items-center gap-2 flex-wrap">
					<h2 class="text-md">{message._SubjectNoHTML}</h2>
					<Badge color="blue">
						<UserOutline size="xs" class="focus:outline-none mr-1" />
						{message._Email}
					</Badge>
					<DateBadge date={new Date(message._BeginDate)} />
					<Badge color="dark">{message._Type}</Badge>
				</Card>
			</li>
		{/each}
	</ol>
{/if}
