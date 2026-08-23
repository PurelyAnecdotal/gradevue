<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { DEFAULT_SYFETCH_URL } from '$lib/syfetch';
	import { StudentAccount } from '$lib/synergy';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import InfoIcon from '@lucide/svelte/icons/info';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import { fly } from 'svelte/transition';

	if (browser && localStorage.getItem(LocalStorageKey.token) !== null) {
		if (!acc.studentAccount) loadStudentAccount();

		void goto('/grades');
	}

	let username: string = $state('');
	let password: string = $state('');
	let domain: string = $state('');
	let syfetchUrl: string = $state(
		(browser && localStorage.getItem(LocalStorageKey.syfetchUrl)) || DEFAULT_SYFETCH_URL
	);
	let disclaimerAccepted = $state(false);

	let loginError: string | undefined = $state();
	let loggingIn = $state(false);

	async function login(event: SubmitEvent) {
		event.preventDefault();

		if (!disclaimerAccepted) {
			loginError = 'Please accept the disclaimer before logging in.';
			return;
		}

		if (loggingIn) return;
		loggingIn = true;
		loginError = undefined;

		const activeSyfetchUrl = syfetchUrl.trim() || DEFAULT_SYFETCH_URL;
		const loginAccount = new StudentAccount(domain, username, password, activeSyfetchUrl);

		try {
			await loginAccount.checkLogin();
		} catch (error) {
			loggingIn = false;

			loginError = error instanceof Error ? error.message : String(error);
			return;
		}

		acc.studentAccount = loginAccount;

		localStorage.setItem(
			LocalStorageKey.token,
			JSON.stringify({ username, password, domain, syfetchUrl: activeSyfetchUrl })
		);
		localStorage.setItem(LocalStorageKey.syfetchUrl, activeSyfetchUrl);

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
		domainDialogOpen = false;
	}
	let domainDialogOpen = $state(false);
	function openDomainDialog() {
		domainDialogOpen = true;
	}
</script>

<svelte:head>
	<title>Log In - {brand}</title>
</svelte:head>

{#if loggingIn}
	<LoadingBanner>Logging you in...</LoadingBanner>
{/if}

{#if loginError}
	<div in:fly={{ y: -50, duration: 200 }} class="fixed top-0 left-0 z-50 flex w-full justify-center p-4">
		<Alert.Root variant="destructive" class="w-fit">
			<AlertCircleIcon />
			<Alert.Title>Couldn't log in</Alert.Title>
			<Alert.Description>{loginError}</Alert.Description>
		</Alert.Root>
	</div>
{/if}

<div class="flex min-h-screen flex-col">
	<main class="flex grow items-center justify-center">
		<form onsubmit={login} class="m-4 flex w-full max-w-md flex-col gap-4">
			<div class="mb-4 flex flex-col items-center gap-2">
				<img src="/favicon.svg" class="h-8 w-8" alt={brand} />

				<h1 class="text-xl font-bold">Log in to {brand}</h1>
			</div>

			<Field.Group>
				<Field.Field>
					<Field.Label for="username">Username</Field.Label>
					<Input
						id="username"
						type="text"
						bind:value={username}
						placeholder="student@school.net"
						autocomplete="username"
						required
					/>
				</Field.Field>

				<Field.Field>
					<Field.Label for="password">Password</Field.Label>
					<Input
						type="password"
						id="password"
						bind:value={password}
						autocomplete="current-password"
						required
					/>
					<Field.Description>
						Your device connects directly via blind zero-knowledge E2EE proxy. We never see your
						password or your grades.
					</Field.Description>
				</Field.Field>

				<Field.Field>
					<Field.Label for="domain">Your District's Portal Domain</Field.Label>

					<Alert.Root>
						<InfoIcon />
						<Alert.Title class="line-clamp-none">
							{brand} can
							<button type="button" onclick={openDomainDialog} class="underline">
								find your domain for you
							</button>.
						</Alert.Title>
					</Alert.Root>

					<Input
						type="text"
						id="domain"
						placeholder="[your-district]-psv.edupoint.com"
						autocomplete="on"
						autocorrect="off"
						bind:value={domain}
						required
					/>
				</Field.Field>

				<Field.Field>
					<Field.Label for="syfetchUrl">syfetch Proxy URL</Field.Label>

					<Alert.Root>
						<ShieldCheckIcon />
						<Alert.Title class="line-clamp-none">
							Bypasses CORS with zero-knowledge client-side TLS encryption.
						</Alert.Title>
					</Alert.Root>

					<Input
						type="text"
						id="syfetchUrl"
						placeholder="syfetch.chronosirius.xyz"
						autocomplete="on"
						autocorrect="off"
						bind:value={syfetchUrl}
						required
					/>
					<Field.Description>
						Default proxy server: <code>syfetch.chronosirius.xyz</code>
					</Field.Description>
				</Field.Field>

				<Dialog.Root bind:open={domainDialogOpen}>
					<Dialog.Content>
						<form onsubmit={findDomain} class="space-y-4">
							<Label for="pastedUrl">Paste any link to your district's web portal</Label>

							<div class="flex gap-2">
								<Input
									id="pastedUrl"
									type="url"
									placeholder="https://[your-district]-psv.edupoint.com/Home_PXP2.aspx"
									bind:value={pastedUrl}
									required
								/>
								<Button type="submit" disabled={convertedDomain === undefined}>Submit</Button>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Root>

				<div
					class="hover:bg-muted/40 active:bg-muted/60 flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors select-none"
					onclick={() => (disclaimerAccepted = !disclaimerAccepted)}
					onkeydown={(e) => {
						if (e.key === ' ' || e.key === 'Enter') {
							e.preventDefault();
							disclaimerAccepted = !disclaimerAccepted;
						}
					}}
					role="checkbox"
					aria-checked={disclaimerAccepted}
					tabindex="0"
				>
					<div class="mt-0.5 flex size-5 shrink-0 items-center justify-center pointer-events-none">
						<Checkbox
							checked={disclaimerAccepted}
							id="disclaimer"
							name="disclaimer"
							class="size-5"
						/>
					</div>

					<Label
						for="disclaimer"
						class="text-tertiary-foreground cursor-pointer text-xs leading-relaxed pointer-events-none"
					>
						I understand that {brand} is an independent, unofficial tool and is not affiliated with
						or endorsed by Edupoint Educational Systems LLC. Use of your district's portal is subject
						to Edupoint Educational Systems LLC's terms of service, and I am responsible for ensuring
						my use complies with those terms.
					</Label>
				</div>

				<Field.Field>
					<Button type="submit" class="w-full" variant="card">
						<LogInIcon class="h-4 w-4" /> Log in
					</Button>
				</Field.Field>
			</Field.Group>
		</form>
	</main>
</div>

