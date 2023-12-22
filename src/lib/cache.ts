export function getCache(key: string) {
	const cache = localStorage.getItem(key);
	if (cache) return JSON.parse(cache);
	return null;
}
