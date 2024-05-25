<script lang="ts">
	import { browser } from '$app/environment';
	import { loadMessages } from '$lib/cache';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { messages, messagesLoaded, studentAccount } from '$lib/stores';
	import { Badge, Button, Card } from 'flowbite-svelte';
	import { ArrowUpRightFromSquareOutline, UserOutline } from 'flowbite-svelte-icons';

	if (!$messages && browser) loadMessages();

	let authenticating = false;

	async function generateMessagesURL() {
		if (!$studentAccount) return;

		authenticating = true;

		const token = (await $studentAccount.getAuthToken())._EncyToken;

		const url = new URL(`https://${$studentAccount.domain}/PXP2_Messages.aspx`);

		const queryParams = url.searchParams;
		queryParams.append('token', token);
		queryParams.append('LNG', '00');
		queryParams.append('regenerateSessionId', 'True');
		queryParams.append('mobile', 'False');

		open(url.toString(), '_blank');

		authenticating = false;
	}
</script>

<LoadingBanner show={!$messagesLoaded} loadingMsg="Loading messages..." />
<LoadingBanner show={authenticating} loadingMsg="Authenticating..." />

{#if $messages}
	<ol class="p-4 space-y-4">
		{#each $messages as message}
			<li>
				<Card class="dark:text-white max-w-none flex flex-row justify-between gap-2">
					<div class="flex flex-col gap-2">
						<h2 class="text-xl">{message._SubjectNoHTML}</h2>
						<div class="flex flex-row items-center gap-2 flex-wrap">
							<Badge color="blue">
								<UserOutline size="xs" class="focus:outline-none mr-1" />
								{message._Email}
							</Badge>
							<DateBadge date={new Date(message._BeginDate)} />
							<Badge color="dark">{message._Type}</Badge>
						</div>
					</div>
					<Button
						on:click={generateMessagesURL}
						color="alternative"
						class="my-auto whitespace-nowrap"
					>
						<ArrowUpRightFromSquareOutline size="sm" class="focus:outline-none mr-1" />
						View <span class="hidden lg:inline">&nbsp;on Synergy</span>
					</Button>
				</Card>
			</li>
		{/each}
	</ol>
{/if}
