<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
</script>

{#if browser && history.length > 0}
	<Button
		onclick={() => history.back()}
		variant="outline"
		class="w-fit cursor-pointer rounded-full"
	>
		<ChevronLeftIcon class="size-4" /> Back
	</Button>
{/if}
