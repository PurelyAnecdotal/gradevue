<script lang="ts">
	import { browser } from '$app/environment';
	import { brand } from '$lib';
	import { Card } from 'flowbite-svelte';

	let email = $state('[email protected]');
	if (browser) email = 'hello@gradevue.org';
</script>

<svelte:head>
	<title>Privacy - {brand}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<Card size="lg" class="gap-4">
		<h1 class="text-2xl text-white">About the privacy of {brand}</h1>
		<p>
			{brand} is designed to keep students' information private the entire
			time you use the service. It's similar to using the StudentVue app; even though you're not
			viewing the offical website, you're still accessing your grades securely, just in a more
			convenient manner.
		</p>

		<p>
			When a student logs in to {brand}, their username and password are sent directly to the
			offical website, using the built-in
			<a
				href="https://ca-pleas-psv.edupoint.com/Service/PXPCommunication.asmx"
				class="text-primary-600 underline"
			>
				Synergy API
			</a>.
		</p>

		<span>
			If you have questions or concerns about {brand}, please contact me at
			<a href="mailto:{email}" class="text-primary-600 underline">{email}</a>.
		</span>
	</Card>
</div>
