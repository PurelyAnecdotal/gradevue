const PAGE_SOURCE = 'gradecompass-page';
const BRIDGE_SOURCE = 'gradecompass-bridge';

window.addEventListener('message', (event) => {
	if (event.source !== window) return;
	const data = event.data;
	if (!data || data.source !== PAGE_SOURCE || typeof data.id !== 'number') return;

	const id = data.id;
	chrome.runtime.sendMessage(data.payload, (response) => {
		const error = chrome.runtime.lastError;
		window.postMessage(
			{
				source: BRIDGE_SOURCE,
				id,
				response: error ? { ok: false, error: error.message } : response
			},
			'*'
		);
	});
});
