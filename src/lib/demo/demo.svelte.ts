import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { LocalStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import { StudentAccount } from '$lib/synergy';

export const demoMockDomain = 'demo.gradecompass.com';

export let demoState = $state({
	enabled: browser && localStorage.getItem(LocalStorageKey.demo) === 'true'
});

export async function openDemo() {
	demoState.enabled = true;
	localStorage.setItem(LocalStorageKey.demo, 'true');

	const username = 'username';
	const password = 'password';
	const domain = demoMockDomain;

	acc.studentAccount = new StudentAccount(domain, username, password);
	localStorage.setItem(LocalStorageKey.token, JSON.stringify({ username, password, domain }));

	const { worker } = await import('$lib/demo/browser');

	await worker.start({
		onUnhandledRequest(request, print) {
			// Do not warn on unhandled internal Svelte requests.
			// Those are not meant to be mocked.
			if (request.url.includes('svelte')) return;

			if (new URL(request.url).hostname !== demoMockDomain) return;

			print.warning();
		}
	});

	goto('/grades');
}

export async function closeDemo() {
	demoState.enabled = false;
	localStorage.removeItem(LocalStorageKey.demo);
	localStorage.removeItem(LocalStorageKey.token);

	const { worker } = await import('$lib/demo/browser');
	await worker.stop();

	goto('/');
}