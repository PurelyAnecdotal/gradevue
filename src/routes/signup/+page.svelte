<script lang="ts">
	import { Button } from 'flowbite-svelte';
</script>

<h2 class="text-lg">How do you sign in to StudentVue?</h2>

<div class="flex space-x-2">
	<Button color="light" class="w-full" href="/signup/google">with Google</Button>
	<Button color="light" class="w-full" href="/signup/password">with a password</Button>
</div>
