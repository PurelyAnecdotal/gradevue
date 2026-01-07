<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { Spinner } from '$lib/components/ui/spinner';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		show?: boolean;
		loadingMsg?: string;
	}
	let { show = true, loadingMsg = 'Loading...' }: Props = $props();
</script>

{#if show}
	<div class="flex justify-center" in:fade out:fly={{ y: '-50%' }}>
		<Item.Root variant="muted" size="sm" class="bg-muted/90 fixed top-6 z-10">
			<Item.Media><Spinner /></Item.Media>

			<Item.Content>
				<Item.Title>{loadingMsg}</Item.Title>
			</Item.Content>
		</Item.Root>
	</div>
{/if}
