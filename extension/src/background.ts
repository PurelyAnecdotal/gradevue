import {
	districtOrigin,
	fetchPxp2Gradebook,
	fetchStudent,
	hasPxp2Session,
	normalizeDomain,
	type Pxp2Transport
} from '../../src/lib/pxp2';
import type { BridgeRequest, BridgeResponse, Pxp2StudentInfo } from '../../src/lib/pxp2/protocol';

const TRUSTED_HOSTS = new Set([
	'gradecompass.org',
	'gradecompass.localhost',
	'localhost',
	'127.0.0.1'
]);

function isTrustedSender(sender: { url?: string; tab?: { url?: string } }): boolean {
	const raw = sender.tab?.url ?? sender.url;
	if (raw === undefined || raw.length === 0) return false;

	try {
		const url = new URL(raw);
		return TRUSTED_HOSTS.has(url.hostname) || url.hostname.endsWith('.gradecompass.org');
	} catch {
		return false;
	}
}

function transportFor(domain: string): Pxp2Transport {
	return {
		origin: districtOrigin(domain),
		fetch: globalThis.fetch.bind(globalThis)
	};
}

async function ensureHostPermission(domain: string): Promise<void> {
	const origin = `${districtOrigin(domain)}/*`;
	const already = await chrome.permissions.contains({ origins: [origin] });
	if (already) return;

	const granted = await chrome.permissions.request({ origins: [origin] });
	if (!granted) {
		throw new Error('Permission to access your district portal was denied');
	}
}

async function waitForSession(domain: string, timeoutMs = 5 * 60 * 1000): Promise<Pxp2StudentInfo> {
	const transport = transportFor(domain);
	const started = Date.now();

	while (Date.now() - started < timeoutMs) {
		const student = await hasPxp2Session(transport);
		if (student !== undefined) return student;
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	throw new Error('Timed out waiting for a StudentVUE login');
}

async function beginLogin(domain: string): Promise<Pxp2StudentInfo> {
	await ensureHostPermission(domain);
	const existing = await hasPxp2Session(transportFor(domain));
	if (existing !== undefined) return existing;

	await chrome.tabs.create({
		url: `${districtOrigin(domain)}/PXP2_Login_Student.aspx?regenerateSessionId=True`,
		active: true
	});

	return waitForSession(domain);
}

async function handle(message: BridgeRequest): Promise<unknown> {
	switch (message.type) {
		case 'ping':
			return true;
		case 'hasSession': {
			const domain = normalizeDomain(message.domain);
			const origin = `${districtOrigin(domain)}/*`;
			const allowed = await chrome.permissions.contains({ origins: [origin] });
			if (!allowed) return { loggedIn: false };
			const student = await hasPxp2Session(transportFor(domain));
			return { loggedIn: student !== undefined, student };
		}
		case 'beginLogin': {
			const domain = normalizeDomain(message.domain);
			return beginLogin(domain);
		}
		case 'gradebook': {
			const domain = normalizeDomain(message.domain);
			await ensureHostPermission(domain);
			return fetchPxp2Gradebook(transportFor(domain), message.reportPeriod);
		}
		case 'studentInfo': {
			const domain = normalizeDomain(message.domain);
			await ensureHostPermission(domain);
			return fetchStudent(transportFor(domain));
		}
		default:
			throw new Error('Unknown companion extension request');
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!isTrustedSender(sender)) {
		sendResponse({ ok: false, error: 'Untrusted sender' } satisfies BridgeResponse);
		return false;
	}

	void handle(message as BridgeRequest)
		.then((data) => sendResponse({ ok: true, data } satisfies BridgeResponse))
		.catch((error: unknown) => {
			const text = error instanceof Error ? error.message : String(error);
			sendResponse({ ok: false, error: text } satisfies BridgeResponse);
		});

	return true;
});
