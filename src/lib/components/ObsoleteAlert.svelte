<script lang="ts">
	import { PowerIcon } from '@lucide/svelte';
	import * as Alert from '$lib/components/ui/alert';
</script>

<Alert.Root variant="destructive" class="mt-4">
	<PowerIcon />
	<Alert.Title>GradeCompass is now obsolete.</Alert.Title>
	<Alert.Description>
		<a href="/obsolete" class="underline">Learn more</a>
	</Alert.Description>
</Alert.Root>
