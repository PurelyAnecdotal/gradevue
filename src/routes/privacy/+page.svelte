<script lang="ts">
	import { browser } from '$app/environment';
	import { brand, contactEmail } from '$lib/brand';
	import * as Card from '$lib/components/ui/card';

	let email = $state('[email protected]');
	if (browser) email = contactEmail;
</script>

<svelte:head>
	<title>Privacy - {brand}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		<Card.Root class="m-4 max-w-xl">
			<Card.Header>
				<Card.Title>About the privacy of {brand}</Card.Title>
			</Card.Header>

			<Card.Content class="text-tertiary-foreground space-y-4">
				<p>
					{brand} was designed to keep students' information private.
				</p>

				<p>
					When a student uses the {brand} interface with the companion extension, they log in on the official
					student portal. The extension reads gradebook data using the browser's cookies and returns it
					to this page. {brand} servers do not receive student data or login information.
				</p>

				<p>
					Without the extension, {brand} can only run its on-device demo. The website cannot talk to the
					new StudentVUE protocol by itself.
				</p>

				<p>
					If you have questions or concerns about {brand}, you can contact us at
					<a href="mailto:{email}" class="underline">{email}</a>.
				</p>
			</Card.Content>
		</Card.Root>
	</main>
</div>
