<script lang="ts">
	import { goto } from '$app/navigation';
	import { studentAccount } from '$lib/stores';
	import { StudentAccount } from '$lib/synergy';

	function logOut() {
		localStorage.removeItem('token');

		goto('/login');
	}

	if (!$studentAccount) {
		if (localStorage.getItem('token')) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		} else {
			goto('/login');
		}
	}
</script>

<button on:click={logOut}>Log out</button>

<slot />
