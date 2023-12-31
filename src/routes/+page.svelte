<script lang="ts">
	import { goto } from '$app/navigation';
	import { StudentAccount } from '$lib/synergy';
	import { studentAccount } from '$lib/stores';
	import { Card, Button } from 'flowbite-svelte';

	if (localStorage.getItem('token')) {
		if (!$studentAccount) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		}

		goto('/grades');
	}
</script>

<div class="flex items-center justify-center min-h-screen">
	<Card>
		<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gradebook</h5>
		<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
			An improved StudentVue experience.
		</p>
		<Button href="/login" class="mt-4">Log in</Button>
	</Card>
</div>
