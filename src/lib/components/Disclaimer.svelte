<script lang="ts">
	import { brand } from '$lib/brand';

	interface Props {
		trademark?: boolean;
	}
	let { trademark = true }: Props = $props();
</script>

<p class="text-muted-foreground mx-auto p-4 text-center text-xs">
	{#if trademark}StudentVUE is a registered trademark of Edupoint Educational Systems LLC.{/if}
	{brand} is not affiliated with or endorsed by Edupoint Educational Systems LLC.
</p>
