<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
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

	interface ProxyPrivacyInfo {
		requiresConsentCheckmark: boolean;
		consentCheckmarkText?: string;
	}

	let proxyPrivacy = $state<ProxyPrivacyInfo | null>(null);
	let proxyConsentAccepted = $state(false);

	function getPrivacyEndpointUrl(rawUrl: string): string {
		let url = rawUrl.trim();
		if (!url) return '';
		if (
			!url.startsWith('http://') &&
			!url.startsWith('https://') &&
			!url.startsWith('ws://') &&
			!url.startsWith('wss://')
		) {
			url = (url.includes('localhost') || url.includes('127.0.0.1') ? 'http://' : 'https://') + url;
		}
		url = url.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
		try {
			const u = new URL(url);
			return `${u.protocol}//${u.host}/privacy`;
		} catch {
			return `${url}/privacy`;
		}
	}

	async function fetchProxyPrivacy(url: string) {
		const endpoint = getPrivacyEndpointUrl(url);
		if (!endpoint) {
			proxyPrivacy = null;
			return;
		}
		try {
			const res = await fetch(endpoint);
			if (res.ok) {
				const json = await res.json();
				if (json?.privacy) {
					proxyPrivacy = {
						requiresConsentCheckmark: json.privacy.requiresConsentCheckmark ?? true,
						consentCheckmarkText: json.privacy.consentCheckmarkText
					};
					return;
				}
			}
		} catch {
			// Fallback if unreachable
		}
		const isDefaultOrPublic = !url.includes('localhost') && !url.includes('127.0.0.1');
		proxyPrivacy = {
			requiresConsentCheckmark: isDefaultOrPublic,
			consentCheckmarkText:
				'I understand that traffic through this blind proxy is encrypted directly on my device and the proxy operator has zero visibility into my credentials or data.'
		};
	}

	$effect(() => {
		if (browser) {
			void fetchProxyPrivacy(syfetchUrl);
		}
	});

	let loginError: string | undefined = $state();
	let loggingIn = $state(false);

	async function login(event: SubmitEvent) {
		event.preventDefault();

		if (!disclaimerAccepted) {
			loginError = 'Please accept the disclaimer before logging in.';
			return;
		}

		if (proxyPrivacy?.requiresConsentCheckmark && !proxyConsentAccepted) {
			loginError = 'Please accept the proxy privacy consent before logging in.';
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
						Your password and grades are private and stored on-device.
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

				<Accordion.Root type="single" class="w-full">
					<Accordion.Item value="proxy-settings" class="border-none">
						<Accordion.Trigger class="text-muted-foreground hover:text-foreground py-1 text-xs">
							Proxy Settings
						</Accordion.Trigger>

						<Accordion.Content class="pt-2 pb-0">
							<Field.Field>
								<Field.Label for="syfetchUrl" class="text-xs">Blind Proxy URL</Field.Label>

								<Input
									type="text"
									id="syfetchUrl"
									placeholder="syfetch.chronosirius.xyz"
									autocomplete="on"
									autocorrect="off"
									bind:value={syfetchUrl}
									class="text-sm"
								/>
								<Field.Description class="text-xs">
									Due to browser restrictions, a blind proxy is required to connect to district portals.
									<a
										href="https://github.com/chronosirius/syfetch"
										target="_blank"
										rel="noopener noreferrer"
										class="underline hover:text-foreground"
									>
										More information
									</a>
								</Field.Description>
							</Field.Field>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>

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

				{#if proxyPrivacy?.requiresConsentCheckmark}
					<div
						class="hover:bg-muted/40 active:bg-muted/60 flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors select-none"
						onclick={() => (proxyConsentAccepted = !proxyConsentAccepted)}
						onkeydown={(e) => {
							if (e.key === ' ' || e.key === 'Enter') {
								e.preventDefault();
								proxyConsentAccepted = !proxyConsentAccepted;
							}
						}}
						role="checkbox"
						aria-checked={proxyConsentAccepted}
						tabindex="0"
					>
						<div class="mt-0.5 flex size-5 shrink-0 items-center justify-center pointer-events-none">
							<Checkbox
								checked={proxyConsentAccepted}
								id="proxy-consent"
								name="proxy-consent"
								class="size-5"
							/>
						</div>

						<Label
							for="proxy-consent"
							class="text-tertiary-foreground cursor-pointer text-xs leading-relaxed pointer-events-none"
						>
							{proxyPrivacy.consentCheckmarkText ||
								'I understand that traffic through this blind proxy is encrypted directly on my device and the proxy operator has zero visibility into my credentials or data.'}
						</Label>
					</div>
				{/if}

				<Field.Field>
					<Button type="submit" class="w-full" variant="card">
						<LogInIcon class="h-4 w-4" /> Log in
					</Button>
				</Field.Field>
			</Field.Group>
		</form>
	</main>
</div>

