<script lang="ts">
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import '../app.css';

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');

			registerSW({
				immediate: true,
				onRegistered(r) {
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error) {
					console.log('SW registration error', error);
				}
			});
		}
	});
</script>

<svelte:head>
	{@html pwaInfo?.webManifest.linkTag ?? ''}
</svelte:head>

<slot />
