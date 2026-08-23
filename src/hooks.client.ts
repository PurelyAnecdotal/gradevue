import { browser } from '$app/environment';
import { demoMockDomain, LocalStorageKey } from '$lib/constants';
import type { ClientInit } from '@sveltejs/kit';
import { writable, type Writable } from 'svelte/store';

export const installPrompt: Writable<{ prompt?: () => Promise<UserChoice> }> = writable({});

interface UserChoice {
	outcome: 'accepted' | 'dismissed';
	platform: string;
}

interface BeforeInstallPromptEvent extends Event {
	platforms: string[];
	userChoice: Promise<UserChoice>;
	prompt: () => Promise<UserChoice>;
}

export const init: ClientInit = () => {
	addEventListener('beforeinstallprompt', (e) => {
		const event = e as BeforeInstallPromptEvent;

		event.preventDefault();
		installPrompt.set({ prompt: event.prompt.bind(event) });
	});
};

// https://github.com/mswjs/examples/blob/main/examples/with-svelte/src/hooks.client.ts
if (browser && localStorage.getItem(LocalStorageKey.demo) === 'true') {
	const { worker } = await import('$lib/demo/browser');

	// @ts-ignore
	window.demoMsw = worker;

	await worker.start({
		onUnhandledRequest(request, print) {
			// Do not warn on unhandled internal Svelte requests.
			// Those are not meant to be mocked.
			if (request.url.includes('svelte')) return;

			if (new URL(request.url).hostname !== demoMockDomain) return;

			print.warning();
		}
	});
}
