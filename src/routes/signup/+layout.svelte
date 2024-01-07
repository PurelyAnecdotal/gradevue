<script lang="ts">
	import { Card } from 'flowbite-svelte';
</script>

<div class="flex items-center justify-center min-h-screen">
	<Card class="text-sm dark:text-gray-200 leading-relaxed space-y-4">
		<h1 class="text-xl dark:text-white">Sign up for Gradebook</h1>

		<slot />
	</Card>
</div>
