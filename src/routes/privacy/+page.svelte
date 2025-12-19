<script lang="ts">
	import { browser } from '$app/environment';
	import { brand } from '$lib';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import { Card } from 'flowbite-svelte';

	let email = $state('[email protected]');
	if (browser) email = 'hello@gradevue.org';
</script>

<svelte:head>
	<title>Privacy - {brand}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<div class="flex grow items-center">
		<Card size="lg" class="m-4 gap-4 dark:text-gray-200">
			<h1 class="text-2xl dark:text-white">About the privacy of {brand}</h1>

			<p>
				{brand} is designed to keep students' information private the entire time they use the service.
			</p>

			<p>
				When a student uses {brand}, their own device sends their username and password directly to
				the offical student portal, and the portal returns their student information directly to
				their device. {brand} servers do not receive or process any student information. All student information
				is stored and processed on-device.
			</p>

			<p>
				If you have questions or concerns about {brand}, please contact us at
				<a href="mailto:{email}" class="text-primary-600 underline">{email}</a>.
			</p>
		</Card>
	</div>

	<Disclaimer />
</div>
