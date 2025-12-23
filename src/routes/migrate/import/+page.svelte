<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { LocalStorageKey } from '$lib';
	import { Button, Card } from 'flowbite-svelte';

	const sourceOrigin = page.url.searchParams.get('origin');

	let hasExistingData = $state(false);

	if (browser) {
		hasExistingData = localStorage.getItem(LocalStorageKey.token) !== null;

		if (!hasExistingData) startMigration();
	}

	function startMigration() {
		if (env.PUBLIC_ALLOWED_MIGRATION_ORIGINS === undefined) return;

		const allowedMigrationOrigins = env.PUBLIC_ALLOWED_MIGRATION_ORIGINS.split(',');

		if (opener !== null && sourceOrigin !== null) {
			(opener as Window).postMessage('ready', sourceOrigin);

			addEventListener('message', ({ origin, data, source }) => {
				if (!allowedMigrationOrigins.includes(origin) || !(data instanceof Map)) return;

				data.forEach((value, key) => localStorage.setItem(key, value));

				source?.postMessage('success', { targetOrigin: origin });

				goto('/grades');
			});
		}
	}
</script>

<div class="flex min-h-screen min-w-screen items-center justify-center">
	<Card class="space-y-4 dark:text-gray-200">
		{#if sourceOrigin !== null}
			<h1 class="text-xl">Migrating user data from {sourceOrigin}...</h1>

			{#if hasExistingData}
				<p>You already have data here. Would you like to overwrite it?</p>

				<div class="flex gap-2">
					<Button href="/grades" color="light" class="w-full">Cancel</Button>
					<Button onclick={startMigration} color="red" class="w-full cursor-pointer">
						Overwrite
					</Button>
				</div>
			{/if}
		{:else}
			<h1 class="text-xl">Cannot migrate user data: source origin unspecified</h1>
		{/if}
	</Card>
</div>
