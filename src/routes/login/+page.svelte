<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { StudentAccount } from '$lib/synergy';
	import { Alert, Button, Card, Checkbox, Helper, Input, Label, Popover } from 'flowbite-svelte';
	import ExclamationCircleSolid from 'flowbite-svelte-icons/ExclamationCircleSolid.svelte';
	import EyeSlashOutline from 'flowbite-svelte-icons/EyeSlashOutline.svelte';
	import InfoCircleOutline from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
	import { fly } from 'svelte/transition';

	if (browser && localStorage.getItem(LocalStorageKey.token) !== null) {
		if (!acc.studentAccount) loadStudentAccount();

		void goto('/grades');
	}

	let username: string = $state('');
	let password: string = $state('');
	let domain: string = $state('');

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

		void goto('/grades');
	}

	let pastedUrl = $state('');
	const convertedDomain = $derived.by(() => {
		try {
			const url = new URL(pastedUrl);
			return url.host;
		} catch {
			return undefined;
		}
	});

	function findDomain() {
		if (convertedDomain === undefined) return;
		domain = convertedDomain;
	}
</script>

<svelte:head>
	<title>Log In - {brand}</title>
</svelte:head>

<LoadingBanner show={loggingIn} loadingMsg="Logging you in..." />

{#if loginError}
	<div in:fly={{ y: -50, duration: 200 }} class="fixed top-0 left-0 flex w-full justify-center p-4">
		<Alert color="red">
			<ExclamationCircleSolid slot="icon" />
			<span class="font-bold">Couldn't log in</span>
			<p>{loginError}</p>
		</Alert>
	</div>
{/if}

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		<Card>
			<form onsubmit={login} class="space-y-4">
				<h1 class="text-xl dark:text-white">Sign in to {brand}</h1>

				<p class="space-y-2">
					<Label for="username">StudentVUE Username</Label>
					<Input
						type="text"
						id="username"
						bind:value={username}
						placeholder="student@school.net"
						autocomplete="username"
						required
					/>
				</p>

				<p class="space-y-2">
					<Label for="password">StudentVUE Password</Label>
					<Input
						type="password"
						id="password"
						bind:value={password}
						autocomplete="current-password"
						required
					/>
					<Helper class="flex items-center text-xs">
						<EyeSlashOutline size="sm" class="mr-2" />
						Your device connects directly to StudentVUE. We can't see your password or your grades.
					</Helper>
					<Helper class="flex items-center text-xs">
						<InfoCircleOutline size="sm" class="mr-2" />
						<span>
							If you've never used {brand} before, you may need to
							<a href="/signup" class="text-primary-600 underline">create a password</a>.
						</span>
					</Helper>
				</p>

				<p class="space-y-2">
					<Label for="domain" class="flex w-full justify-between">
						StudentVUE Domain
						<button class="text-primary-700 cursor-pointer text-xs underline">
							Help me find my domain
						</button>
						<Popover
							class="w-96"
							title="Paste any link to your district's StudentVUE website"
							trigger="click"
						>
							<div class="flex items-center gap-2">
								<Input
									type="url"
									placeholder="https://[your-district]-psv.edupoint.com/Home_PXP2.aspx"
									bind:value={pastedUrl}
								/>
								<Button
									onclick={findDomain}
									disabled={convertedDomain === undefined}
									class={convertedDomain === undefined ? 'cursor-not-allowed' : 'cursor-pointer'}
								>
									Submit
								</Button>
							</div>
						</Popover>
					</Label>
					<Input
						type="text"
						id="domain"
						placeholder="[your-district]-psv.edupoint.com"
						autocomplete="on"
						bind:value={domain}
						required
					/>
				</p>

				<Checkbox class="text-xs" required>
					I understand that {brand} is an independent, unofficial application and is not affiliated with
					or endorsed by Edupoint Educational Systems LLC. Use of StudentVUE is subject to Edupoint Educational
					Systems LLC's terms of service, and I am responsible for ensuring my use complies with those
					terms.
				</Checkbox>

				<Button type="submit" class="w-full">Log in</Button>
			</form>
		</Card>
	</main>

	<Disclaimer />
</div>
