<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { StudentAccount } from '$lib/synergy';
	import {
		Accordion,
		AccordionItem,
		Alert,
		Button,
		Card,
		Helper,
		Input,
		Label
	} from 'flowbite-svelte';
	import ExclamationCircleSolid from 'flowbite-svelte-icons/ExclamationCircleSolid.svelte';
	import EyeSlashOutline from 'flowbite-svelte-icons/EyeSlashOutline.svelte';
	import InfoCircleOutline from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
	import { fly } from 'svelte/transition';

	if (browser && localStorage.getItem(LocalStorageKey.token)) {
		if (!acc.studentAccount) loadStudentAccount();

		goto('/grades');
	}

	let username: string = $state('');
	let password: string = $state('');
	let domain: string = $state('ca-pleas-psv.edupoint.com');

	let loginError: string | undefined = $state();

	let loggingIn = $state(false);

	async function login(event: SubmitEvent) {
		event.preventDefault();

		if (loggingIn) return;
		loggingIn = true;

		const loginAccount = new StudentAccount(domain, username, password);

		try {
			await loginAccount.checkLogin();
		} catch (e) {
			loggingIn = false;

			loginError = e instanceof Error ? e.message : 'An unknown error occurred';
			return;
		}

		acc.studentAccount = loginAccount;

		localStorage.setItem(LocalStorageKey.token, JSON.stringify({ username, password, domain }));

		loggingIn = false;

		goto('/grades');
	}
</script>

<svelte:head>
	<title>Log In - Gradevue</title>
</svelte:head>

<LoadingBanner show={loggingIn} loadingMsg="Logging you in..." />

{#if loginError}
	<div in:fly={{ y: -50, duration: 200 }} class="fixed left-0 top-0 flex w-full justify-center p-4">
		<Alert color="red">
			<ExclamationCircleSolid slot="icon" />
			<span class="font-bold">Couldn't log in</span>
			<p>{loginError}</p>
		</Alert>
	</div>
{/if}

<div class="flex min-h-screen items-center justify-center">
	<Card>
		<form onsubmit={login}>
			<h1 class="mb-4 text-xl dark:text-white">Sign in to GradeVue</h1>
			<Label class="mb-4 space-y-2">
				<span>Username</span>
				<Input
					type="text"
					id="username"
					bind:value={username}
					placeholder="student@school.net"
					required
				/>
			</Label>
			<Label class="mb-4 space-y-2">
				<span>Password</span>
				<Input type="password" id="password" bind:value={password} class="mb-2" required />
				<Helper class="flex items-center text-xs">
					<EyeSlashOutline size="sm" class="mr-2" />
					Your device connects directly to StudentVue. We can't see your password or your grades.
				</Helper>
				<Helper class="flex items-center text-xs">
					<InfoCircleOutline size="sm" class="mr-2" />
					<span>
						If you've never used GradeVue or SynergyPlus before, you may need to
						<a href="/signup" class="text-primary-600 underline">create a password</a>.
					</span>
				</Helper>
			</Label>
			<Accordion flush class="mb-4">
				<AccordionItem paddingFlush="mb-2" borderBottomClass="">
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
