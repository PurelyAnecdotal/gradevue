import {
	BRIDGE_SOURCE,
	PAGE_SOURCE,
	type BridgeRequest,
	type BridgeResponse
} from '$lib/pxp2/protocol';

interface Pending {
	resolve: (value: unknown) => void;
	reject: (error: Error) => void;
	timer: number;
}

const pending = new Map<number, Pending>();
let requestId = 0;
let listening = false;

function ensureListener() {
	if (listening || typeof window === 'undefined') return;
	listening = true;

	window.addEventListener('message', (event: MessageEvent) => {
		if (event.source !== window) return;
		const data = event.data as { source?: string; id?: number; response?: BridgeResponse } | null;
		if (data?.source !== BRIDGE_SOURCE || typeof data.id !== 'number') return;

		const waiter = pending.get(data.id);
		if (waiter === undefined) return;

		window.clearTimeout(waiter.timer);
		pending.delete(data.id);

		const response = data.response;
		if (response === undefined) {
			waiter.reject(new Error('Empty response from the companion extension'));
			return;
		}
		if (response.ok) waiter.resolve(response.data);
		else waiter.reject(new Error(response.error));
	});
}

export async function pingBridge(timeoutMs = 400): Promise<boolean> {
	try {
		const result = await bridgeRequest({ type: 'ping' }, timeoutMs);
		return result === true;
	} catch {
		return false;
	}
}

export async function bridgeRequest<T>(payload: BridgeRequest, timeoutMs = 120000): Promise<T> {
	if (typeof window === 'undefined') {
		throw new Error('The companion extension only works in the browser');
	}

	ensureListener();

	return await new Promise<T>((resolve, reject) => {
		const id = ++requestId;
		const timer = window.setTimeout(() => {
			pending.delete(id);
			reject(new Error('The GradeCompass companion extension did not respond'));
		}, timeoutMs);

		pending.set(id, {
			resolve: (value) => resolve(value as T),
			reject,
			timer
		});

		window.postMessage({ source: PAGE_SOURCE, id, payload }, '*');
	});
}
