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
					{brand} is designed to keep students' information completely private and secure.
				</p>

				<p>
					When you use {brand}, your device communicates with your student portal using <code>syfetch</code>,
					a zero-knowledge blind CORS proxy. TLS encryption is terminated directly on your device using WebCrypto,
					meaning the proxy only relays opaque binary ciphertext and cannot see your credentials, headers, or grades.
				</p>

				<p>
					{brand} servers do not receive any student data or login information. The GradeCompass interface
					is purely client-side: all data is retrieved, processed, and stored on-device.
				</p>

				<p>
					If you have questions or concerns about {brand}, you can contact us at
					<a href="mailto:{email}" class="underline">{email}</a>.
				</p>
			</Card.Content>
		</Card.Root>
	</main>
</div>
