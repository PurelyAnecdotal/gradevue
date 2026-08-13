<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { pingBridge } from '$lib/bridge';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { openDemo } from '$lib/demo/demo.svelte';
	import { normalizeDomain } from '$lib/pxp2/domain';
	import { StudentAccount } from '$lib/synergy';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import InfoIcon from '@lucide/svelte/icons/info';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import PuzzleIcon from '@lucide/svelte/icons/puzzle';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	if (browser && localStorage.getItem(LocalStorageKey.token) !== null) {
		if (!acc.studentAccount) loadStudentAccount();

		void goto('/grades');
	}

	let domain: string = $state('');
	let loginError: string | undefined = $state();
	let loggingIn = $state(false);
	let bridgeStatus: 'checking' | 'available' | 'missing' = $state('checking');

	onMount(() => {
		void pingBridge().then((available) => {
			bridgeStatus = available ? 'available' : 'missing';
		});
	});

	async function login(event: SubmitEvent) {
		event.preventDefault();

		if (loggingIn || bridgeStatus !== 'available') return;
		loggingIn = true;
		loginError = undefined;

		let host: string;
		try {
			host = normalizeDomain(domain);
		} catch (error) {
			loggingIn = false;
			loginError = error instanceof Error ? error.message : String(error);
			return;
		}

		const loginAccount = StudentAccount.fromPxp2(host);

		try {
			await loginAccount.checkLogin();
		} catch (error) {
			loggingIn = false;
			loginError = error instanceof Error ? error.message : String(error);
			return;
		}

		acc.studentAccount = loginAccount;
		localStorage.setItem(LocalStorageKey.token, JSON.stringify({ domain: host, mode: 'pxp2' }));

		loggingIn = false;
		void goto('/grades');
	}

	let pastedUrl = $state('');
	const convertedDomain = $derived.by(() => {
		try {
			const url = new URL(pastedUrl);
			return url.host.replace(/:\d+$/, '');
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
	<LoadingBanner>Waiting for StudentVUE login...</LoadingBanner>
{/if}

{#if loginError}
	<div in:fly={{ y: -50, duration: 200 }} class="fixed top-0 left-0 flex w-full justify-center p-4">
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

			{#if bridgeStatus === 'missing'}
				<Alert.Root variant="destructive" class="mb-4">
					<PuzzleIcon />
					<Alert.Title>Companion extension required</Alert.Title>
					<Alert.Description>
						The StudentVUE protocol no longer allows a website to log in by itself. Install the
						GradeCompass companion extension, then return here. Your password stays on the official
						portal.
						<p>
							<a href="/obsolete" class="underline">Learn more</a> •
							<button class="cursor-pointer underline" onclick={openDemo} type="button">
								Open demo
							</button>
						</p>
					</Alert.Description>
				</Alert.Root>
			{:else if bridgeStatus === 'available'}
				<Alert.Root class="mb-4">
					<PuzzleIcon />
					<Alert.Title>Companion extension connected</Alert.Title>
					<Alert.Description>
						You'll log in on your district's StudentVUE site. {brand} never sees your password; grades
						stay on this device.
					</Alert.Description>
				</Alert.Root>
			{/if}

			<div class="relative">
				<Field.Group>
					<Field.Field>
						<Field.Label for="domain">Your District's Portal Domain</Field.Label>

						<Alert.Root>
							<InfoIcon />
							<Alert.Title class="line-clamp-none">
								{brand} could
								<button onclick={openDomainDialog} class="underline" type="button">
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
							disabled={bridgeStatus !== 'available'}
						/>
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

					<Field.Field orientation="horizontal" class="items-center">
						<Checkbox
							name="disclaimer"
							id="disclaimer"
							required
							disabled={bridgeStatus !== 'available'}
						/>

						<Field.Label for="disclaimer" class="text-tertiary-foreground text-xs">
							I understand that {brand} is an independent, unofficial tool and is not affiliated with
							or endorsed by Edupoint Educational Systems LLC. Use of your district's portal is subject
							to Edupoint Educational Systems LLC's terms of service, and I am responsible for ensuring
							my use complies with those terms.
						</Field.Label>
					</Field.Field>

					<Field.Field>
						<Button
							type="submit"
							class="w-full"
							variant="card"
							disabled={bridgeStatus !== 'available'}
						>
							<LogInIcon class="h-4 w-4" /> Continue to StudentVUE
						</Button>
					</Field.Field>
				</Field.Group>

				{#if bridgeStatus !== 'available'}
					<div class="absolute -inset-2 backdrop-blur-xs" aria-hidden="true"></div>
				{/if}
			</div>
		</form>
	</main>
</div>
