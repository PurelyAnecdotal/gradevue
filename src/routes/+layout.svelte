<script lang="ts">
	import { pwaInfo } from 'virtual:pwa-info';
	import '../app.css';
</script>

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
	<div class="fixed w-full h-full"><ReloadPrompt /></div>
{/await}

<svelte:head>
	{@html pwaInfo?.webManifest.linkTag ?? ''}
</svelte:head>

<slot />
