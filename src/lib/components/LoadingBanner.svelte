<script lang="ts">
	import { Spinner } from 'flowbite-svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		show?: boolean;
		loadingMsg?: string;
	}

	let { show = true, loadingMsg = 'Loading...' }: Props = $props();
</script>

{#if show}
	<div class="flex justify-center">
		<div class="fixed top-6 z-10 rounded-lg bg-gray-900 opacity-90" in:fade out:fly={{ y: '-50%' }}>
			<Spinner class="m-4" />
			<span class="mr-4 dark:text-white">{loadingMsg}</span>
		</div>
	</div>
{/if}
