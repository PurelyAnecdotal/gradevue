<script lang="ts">
	import { brand } from '$lib';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import { Card } from 'flowbite-svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Sign Up - {brand}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		<Card class="space-y-4 text-sm leading-relaxed dark:text-gray-200">
			<h1 class="text-xl dark:text-white">Sign up for {brand}</h1>

			{@render children?.()}
		</Card>
	</main>

	<Disclaimer />
</div>
