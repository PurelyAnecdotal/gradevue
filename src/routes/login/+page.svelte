<script lang="ts">
	import { goto } from '$app/navigation';
	import { StudentAccount } from '$lib/synergy';
	import { studentAccount } from '../../lib/stores';
	import { Card, Input, Label, Helper, Button } from 'flowbite-svelte';
	import { EyeSlashOutline } from 'flowbite-svelte-icons';

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

<div class="flex items-center justify-center min-h-screen">
	<Card>
		<form on:submit|preventDefault={login}>
			<h3 class="text-xl mb-2 font-medium text-gray-900 dark:text-white">Sign in to Gradebook</h3>
			<div class="mb-2">
				<Label for="username" class="mb-2">Username</Label>
				<Input
					type="text"
					id="username"
					bind:value={username}
					placeholder="student@school.net"
					required
				/>
			</div>
			<div class="mb-2">
				<Label for="password" class="mb-2">Password</Label>
				<Input type="password" id="password" bind:value={password} class="mb-2" required />
				<Helper class="text-xs flex">
					<EyeSlashOutline class='m-2'/>Your device connects directly to Synergy, so we won't see your password.
				</Helper>
			</div>
			<div class="mb-2">
				<Label for="domain" class="mb-2">Domain</Label>
				<Input type="text" id="domain" bind:value={domain} required />
			</div>
			<Button type="submit" class="w-full">Log in</Button>
		</form>
	</Card>
</div>
