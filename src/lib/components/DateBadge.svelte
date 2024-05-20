<script lang="ts">
	import { fullDateFormatter, getRelativeTime, shortDateFormatter } from '$lib';
	import { Badge, Popover } from 'flowbite-svelte';

	export let date: Date;
</script>

<Badge id="date-{date.getTime()}" color="dark">{shortDateFormatter.format(date)}</Badge>
<Popover triggeredBy="#date-{date.getTime()}">
	{fullDateFormatter.format(date)}
	({getRelativeTime(date)})
</Popover>
