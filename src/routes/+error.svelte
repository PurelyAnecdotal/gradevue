<script>
	import { page } from '$app/state';
	import { Button, Card } from 'flowbite-svelte';
</script>

<svelte:head>
	<title>{page.status} {page.error?.message} - GradeVue</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen">
	<Card class="text-sm dark:text-gray-200 leading-relaxed space-y-4">
		<h1 class="text-2xl dark:text-white">{page.status} {page.error?.message}</h1>

		<Button href="/" class="w-full">Go home</Button>
	</Card>
</div>
