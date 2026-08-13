export function normalizeDomain(input: string): string {
	const trimmed = input.trim();
	if (trimmed.length === 0) throw new Error('Enter your district portal domain');

	let host = trimmed;
	if (trimmed.includes('://')) {
		host = new URL(trimmed).host;
	} else {
		host = trimmed.split('/')[0] ?? trimmed;
	}

	host = host.replace(/:\d+$/, '');

	if (host.length === 0 || host.includes('..') || !/^[a-zA-Z0-9.-]+$/.test(host)) {
		throw new Error('Invalid district domain');
	}

	return host;
}

export function districtOrigin(domain: string): string {
	return `https://${normalizeDomain(domain)}`;
}
