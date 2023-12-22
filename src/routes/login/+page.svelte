<script lang="ts">
	import { goto } from '$app/navigation';
	import { StudentAccount } from '$lib/synergy';
	import { studentAccount } from '../../lib/stores';

	if (localStorage.getItem('token')) {
		if (!$studentAccount) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		}

		goto('/grades');
	}

	let username: string;
	let password: string;
	let domain: string = 'ca-pleas-psv.edupoint.com';

	function login() {
		$studentAccount = new StudentAccount(domain, username, password);

		localStorage.setItem('token', JSON.stringify({ username, password, domain }));

		goto('/grades');
	}
</script>

<form on:submit|preventDefault={login}>
	<label>
		Username
		<input name="username" bind:value={username} required />
	</label>
	<label>
		Password
		<input type="password" name="passsword" bind:value={password} required />
	</label>
	<label>
		Domain
		<input name="domain" bind:value={domain} required />
	</label>
	<button type="submit">Login</button>
</form>
