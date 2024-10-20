<script lang="ts">
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { Badge } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronRightOutline } from 'flowbite-svelte-icons';

	export let touchscreen = false;
	export let message: InboxItemListingsMessageXML;
	export let content = '';

	$: from = message.From.RecipientXML;
	$: recipients =
		typeof message.To !== 'string'
			? message.To.RecipientXML instanceof Array
				? message.To.RecipientXML
				: [message.To.RecipientXML]
			: undefined;

	let showRecipients = false;
</script>

<ol>
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
						on:click={() => {
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
	class="w-full h-96 bg-white"
	title="Message Content"
/>
