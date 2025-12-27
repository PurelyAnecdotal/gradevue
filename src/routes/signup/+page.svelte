<script lang="ts">
	import { brand } from '$lib/brand';
	import InfoIcon from '@lucide/svelte/icons/info';
	import { Alert, Button } from 'flowbite-svelte';
</script>

<h2 class="text-lg">How do you sign in to StudentVUE?</h2>

<div class="flex space-x-2">
	<Button color="light" class="w-full" href="/signup/google">with Google</Button>
	<Button color="light" class="w-full" href="/signup/password">with a password</Button>
</div>

<Alert color="dark" class="p-0">
	<InfoIcon slot="icon" class="h-4 w-4 shrink-0" />
	If you've used {brand} before, you're already signed up. Just use the same password to
	<a href="/login" class="text-primary-600 underline">log in</a>.
</Alert>
