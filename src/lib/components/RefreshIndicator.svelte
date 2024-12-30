<script lang="ts">
	import { getRelativeTime } from '$lib';
	import ClockOutline from 'flowbite-svelte-icons/ClockOutline.svelte';

	interface Props {
		lastRefresh: number;
		loaded: boolean;
		refresh: () => unknown;
	}

	let { lastRefresh, loaded, refresh }: Props = $props();
</script>

<div
	class="mx-auto my-2 flex w-fit items-center gap-1 rounded bg-gray-800 px-2 py-1 text-sm text-gray-400"
>
	<ClockOutline size="sm" />
	Last updated {getRelativeTime(new Date(lastRefresh))}
	<button class="ml-1 {loaded ? 'underline' : ''}" onclick={refresh} disabled={!loaded}>
		Refresh
	</button>
</div>
