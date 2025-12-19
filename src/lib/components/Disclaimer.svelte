<script lang="ts">
	import { brand } from '$lib';

	interface Props {
		trademark?: boolean;
	}
	let { trademark = true }: Props = $props();
</script>

<p class="mx-auto p-4 text-center text-xs dark:text-gray-600">
	{#if trademark}StudentVUE is a registered trademark of Edupoint Educational Systems LLC.{/if}
	{brand} is not affiliated with or endorsed by Edupoint Educational Systems LLC.
</p>
