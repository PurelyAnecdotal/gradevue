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

export const init: ClientInit = async () => {
	addEventListener('beforeinstallprompt', (e) => {
		const event = e as BeforeInstallPromptEvent;

		event.preventDefault();
		installPrompt.set({ prompt: event.prompt.bind(event) });
	});
};
