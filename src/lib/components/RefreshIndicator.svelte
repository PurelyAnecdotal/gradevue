<script lang="ts">
	import { getRelativeTime } from '$lib';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		lastRefresh: number;
		loaded: boolean;
		refresh: () => unknown;
	}
	let { lastRefresh, loaded, refresh }: Props = $props();
</script>

<Badge
	variant="secondary"
	class="mx-auto my-2 text-sm p-1 px-3 text-tertiary-foreground"
>
	<ClockIcon class="h-4 w-4" />
	Last updated {getRelativeTime(new Date(lastRefresh))}
	<button
		class={loaded ? 'cursor-pointer underline' : 'cursor-not-allowed'}
		onclick={refresh}
		disabled={!loaded}>Refresh</button
	>
</Badge>
