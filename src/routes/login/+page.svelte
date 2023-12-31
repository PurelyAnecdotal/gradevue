<script lang="ts">
	import { goto } from '$app/navigation';
	import { StudentAccount } from '$lib/synergy';
	import { studentAccount } from '../../lib/stores';
	import { Card, Input, Label, Helper, Button, Accordion, AccordionItem } from 'flowbite-svelte';
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
			<h3 class="text-xl mb-4 dark:text-white">Sign in to Gradebook</h3>
			<Label class="space-y-2 mb-4">
				<span>Username</span>
				<Input
					type="text"
					id="username"
					bind:value={username}
					placeholder="student@school.net"
					required
				/>
			</Label>
			<Label class="space-y-2 mb-4">
				<span>Password</span>
				<Input type="password" id="password" bind:value={password} class="mb-2" required />
				<Helper class="text-xs flex">
					<EyeSlashOutline class="m-2" />Your device connects directly to Synergy, so we won't see
					your password.
				</Helper>
			</Label>
			<Accordion flush class="mb-4">
				<AccordionItem
					paddingFlush="mb-2"
					borderBottomClass=""
					class="text-white"
				>
					<span slot="header" class="text-sm dark:text-gray-300">Advanced</span>
					<Label class="space-y-2">
						<span>Domain</span>
						<Input type="text" id="domain" bind:value={domain} required />
					</Label>
				</AccordionItem>
			</Accordion>
			<Button type="submit" class="w-full">Log in</Button>
		</form>
	</Card>
</div>
