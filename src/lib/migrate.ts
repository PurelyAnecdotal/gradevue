function getLocalStorageMap() {
	const localStorageMap: Map<string, string> = new Map();

	const length = localStorage.length;
	for (let i = 0; i < length; i++) {
		const key = localStorage.key(i);
		if (key === null) continue;

		const value = localStorage.getItem(key);
		if (value === null) continue;

		localStorageMap.set(key, value);
	}

	return localStorageMap;
}

export const migrateData = (currentOrigin: string, targetOrigin: string): Promise<void> =>
	new Promise((resolve, reject) => {
		const params = new URLSearchParams({ origin: currentOrigin });

		const newWindow = open(`${targetOrigin}/migrate/import?${params.toString()}`);
		if (!newWindow) return;

		const localStorageData = getLocalStorageMap();

		addEventListener('message', (e) => {
			if (e.origin !== targetOrigin) return;

			const messageData: unknown = e.data;

			if (messageData === 'ready') {
				newWindow.postMessage(localStorageData, targetOrigin);
			} else if (messageData === 'success') {
				resolve();
			} else {
				reject(messageData);
			}
		});
	});
