<script lang="ts">
	import { goto } from '$app/navigation';
	import { StudentAccount } from '$lib/synergy';
	import { studentAccount } from '../../lib/stores';
	import {
		Card,
		Input,
		Label,
		Helper,
		Button,
		Accordion,
		AccordionItem,
		Modal,
		Alert
	} from 'flowbite-svelte';
	import {
		ExclamationCircleSolid,
		EyeSlashOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';

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

	let loginErrorShown = false;
	let loginError: string;

	async function login() {
		const loginAccount = new StudentAccount(domain, username, password);

		const loginVerify = await loginAccount.request('StudentInfo');

		if (loginVerify.RT_ERROR) {
			loginErrorShown = true;
			loginError = loginVerify.RT_ERROR._ERROR_MESSAGE;
			return;
		}

		$studentAccount = loginAccount;

		localStorage.setItem('token', JSON.stringify({ username, password, domain }));

		goto('/grades');
	}

	let modalShown = false;

	function showModal() {
		modalShown = true;
	}
</script>

{#if loginErrorShown}
	<div class="fixed w-full p-4 top-0 left-0">
		<Alert class="w-full" color="red">
			<ExclamationCircleSolid slot="icon" />
			<span class="font-bold">Couldn't log in</span>
			{loginError}
		</Alert>
	</div>
{/if}

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
				<Helper class="text-xs flex items-center">
					<EyeSlashOutline size="sm" class="mr-2" />
					Your device connects directly to StudentVue. Unlike SynergyPlus, we can't see your password
					or your grades.
				</Helper>
				<Helper class="text-xs flex items-center">
					<InfoCircleOutline size="sm" class="mr-2" />
					<span>
						If you've never used Gradebook or SynergyPlus before, you will need to
						<button on:click={showModal} class="inline text-primary-600 underline" form="">
							create a password
						</button>.
					</span>
				</Helper>
				<Modal
					bind:open={modalShown}
					title="Create a password"
					size="sm"
					outsideclose
					class="dark:text-gray-300 leading-relaxed"
				>
					<p>
						If your district uses Sign in with Google to sign into StudentVue, you will need to
						create a password for StudentVue that Gradebook can sign you in with instead. You'll
						still be able to use Sign in with Google with StudentVue afterwards.
					</p>
					<Button href="https://{domain}/PXP2_Password_Help.aspx" target="_blank">
						Set your StudentVue password
					</Button>
					<p>
						You should receive an email in a few minutes that will contain a link to set your
						password. Once you've created your password, you can use it to sign in to both
						StudentVue and Gradebook.
					</p>
				</Modal>
			</Label>
			<Accordion flush class="mb-4">
				<AccordionItem paddingFlush="mb-2" borderBottomClass="" class="text-white">
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
