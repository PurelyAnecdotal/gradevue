<script lang="ts">
	import { page } from '$app/state';
	import { Alert, Button } from 'flowbite-svelte';
</script>

<svelte:head>
	<title>{page.status} {page.error?.message} - GradeVue</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<Alert color="red" class="max-w-full min-w-sm space-y-4 border-t-4" rounded={false}>
		<h1 class="text-lg font-bold">{page.status} {page.error?.message}</h1>

		<Button href="/" color="alternative" class="mx-auto">Go home</Button>
	</Alert>
</div>
