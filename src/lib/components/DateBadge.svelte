<script lang="ts">
	import { fullDateFormatter, getRelativeTime, shortDateFormatter } from '$lib';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		date: Date;
	}
	let { date }: Props = $props();
</script>

<Badge
	id="date-{date.getTime()}"
	variant="secondary"
	title="{fullDateFormatter.format(date)} ({getRelativeTime(date)})"
>
	{shortDateFormatter.format(date)}
</Badge>
