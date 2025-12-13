<script lang="ts">
	import { fullDateFormatter, getRelativeTime, shortDateFormatter } from '$lib';
	import { Badge, Popover } from 'flowbite-svelte';

	interface Props {
		date: Date;
	}

	let { date }: Props = $props();
</script>

<Badge id="date-{date.getTime()}" color="dark">{shortDateFormatter.format(date)}</Badge>
<Popover triggeredBy="#date-{date.getTime()}" class="max-w-md text-sm dark:text-gray-300">
	{fullDateFormatter.format(date)}
	({getRelativeTime(date)})
</Popover>
