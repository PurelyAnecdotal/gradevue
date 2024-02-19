<script lang="ts">
	import { Button, Toast } from 'flowbite-svelte';
	import { DownloadOutline } from 'flowbite-svelte-icons';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
		onRegistered(r) {
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});

	const reload = () => {
		updateServiceWorker(true);
	};
</script>

{#if $offlineReady || $needRefresh}
	<Toast
		color="green"
		position="bottom-right"
		contentClass="w-full text-sm font-normal flex items-center justify-between"
	>
		<DownloadOutline slot="icon" class="focus:outline-none" />

		<span class="text-gray-300">
			{#if $offlineReady}
				App ready to work offline
			{:else if $needRefresh}
				Update available
			{/if}
		</span>

		{#if $needRefresh}
			<Button on:click={reload} size="xs">Reload</Button>
		{/if}
	</Toast>
{/if}
