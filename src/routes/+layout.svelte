<script lang="ts">
	import { pwaInfo } from 'virtual:pwa-info';
	import '../app.css';
</script>

<svelte:head>
	{@html pwaInfo?.webManifest.linkTag ?? ''}
</svelte:head>

<slot />

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
	<ReloadPrompt />
{/await}