<script>
	import { page } from '$app/state';
	import { Button, Card } from 'flowbite-svelte';
</script>

<svelte:head>
	<title>{page.status} {page.error?.message} - GradeVue</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<Card class="space-y-4 text-sm leading-relaxed dark:text-gray-200">
		<h1 class="text-2xl dark:text-white">{page.status} {page.error?.message}</h1>

		<Button href="/" class="w-full">Go home</Button>
	</Card>
</div>
