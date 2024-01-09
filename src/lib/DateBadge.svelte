<script lang="ts">
	import { Badge, Popover } from 'flowbite-svelte';
	import { shortDateFormatter, fullDateFormatter, getRelativeTime } from '$lib/index';

	export let date: Date;
</script>

<Badge id="date-{date.getTime()}" color="dark">{shortDateFormatter.format(date)}</Badge>
<Popover triggeredBy="#date-{date.getTime()}">
	{fullDateFormatter.format(date)}
	({getRelativeTime(date)})
</Popover>
