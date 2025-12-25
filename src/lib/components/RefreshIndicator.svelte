<script lang="ts">
	import { getRelativeTime } from '$lib';
	import ClockIcon from '@lucide/svelte/icons/clock';

	interface Props {
		lastRefresh: number;
		loaded: boolean;
		refresh: () => unknown;
	}
	let { lastRefresh, loaded, refresh }: Props = $props();
</script>

<div
	class="mx-auto my-2 flex w-fit items-center gap-2 rounded-sm px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-400"
>
	<ClockIcon class="h-4 w-4" />
	Last updated {getRelativeTime(new Date(lastRefresh))}
	<button
		class={loaded ? 'cursor-pointer underline' : 'cursor-not-allowed'}
		onclick={refresh}
		disabled={!loaded}>Refresh</button
	>
</div>
