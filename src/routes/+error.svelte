<script lang="ts">
	import { page } from '$app/state';
	import { brand } from '$lib/brand';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>{page.status} {page.error?.message} - {brand}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<Alert.Root variant="destructive" class="w-fit max-w-full min-w-sm gap-y-2">
		<Alert.Title>{page.status} {page.error?.message}</Alert.Title>

		<Alert.Description>
			<Button href="/" variant="outline">Go home</Button>
		</Alert.Description>
	</Alert.Root>
</div>
