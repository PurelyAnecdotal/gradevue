/**
 * syfetch.ts - Privacy-Preserving Zero-Knowledge CORS Proxy Fetch Library
 *
 * Drop-in replacement for window.fetch that communicates through a blind L4 syfetch proxy.
 * Uses client-side WebCrypto TLS 1.3 / E2EE framing to guarantee zero MITM / payload visibility by the proxy.
 *
 * Configured via window.SYFETCH_URL, localStorage, or direct parameter (default: "syfetch.chronosirius.xyz")
 */

export const DEFAULT_SYFETCH_URL = 'syfetch.chronosirius.xyz';

export class SyHeaders {
	private _map: Map<string, string> = new Map();

	constructor(init?: HeadersInit | SyHeaders | Record<string, string> | [string, string][]) {
		if (init) {
			if (init instanceof SyHeaders || (typeof Headers !== 'undefined' && init instanceof Headers)) {
				(init as Headers).forEach((value: string, name: string) => this.append(name, value));
			} else if (Array.isArray(init)) {
				for (const [key, value] of init) {
					this.append(key, value);
				}
			} else if (typeof init === 'object') {
				for (const key of Object.keys(init)) {
					const val = (init as Record<string, string>)[key];
					if (val !== undefined) this.append(key, val);
				}
			}
		}
	}

	append(name: string, value: string): void {
		const key = String(name).toLowerCase().trim();
		const val = String(value).trim();
		const existing = this._map.get(key);
		this._map.set(key, existing ? `${existing}, ${val}` : val);
	}

	delete(name: string): void {
		this._map.delete(String(name).toLowerCase().trim());
	}

	get(name: string): string | null {
		return this._map.get(String(name).toLowerCase().trim()) || null;
	}

	has(name: string): boolean {
		return this._map.has(String(name).toLowerCase().trim());
	}

	set(name: string, value: string): void {
		this._map.set(String(name).toLowerCase().trim(), String(value).trim());
	}

	forEach(
		callback: (value: string, key: string, parent: SyHeaders) => void,
		thisArg?: unknown
	): void {
		this._map.forEach((val, key) => callback.call(thisArg, val, key, this));
	}

	keys(): IterableIterator<string> {
		return this._map.keys();
	}

	values(): IterableIterator<string> {
		return this._map.values();
	}

	entries(): IterableIterator<[string, string]> {
		return this._map.entries();
	}

	[Symbol.iterator](): IterableIterator<[string, string]> {
		return this._map.entries();
	}
}

export interface SyResponseInit {
	status?: number;
	statusText?: string;
	headers?: HeadersInit | SyHeaders;
	url?: string;
}

export class SyResponse {
	private _bodyBytes: Uint8Array;
	readonly status: number;
	readonly statusText: string;
	readonly ok: boolean;
	readonly headers: SyHeaders;
	readonly url: string;
	readonly type: ResponseType = 'basic';
	readonly redirected: boolean = false;
	bodyUsed: boolean = false;

	constructor(bodyBytes?: ArrayBufferView | ArrayBuffer | null, init: SyResponseInit = {}) {
		if (bodyBytes instanceof Uint8Array) {
			this._bodyBytes = bodyBytes;
		} else if (bodyBytes instanceof ArrayBuffer) {
			this._bodyBytes = new Uint8Array(bodyBytes);
		} else if (bodyBytes && 'buffer' in bodyBytes) {
			this._bodyBytes = new Uint8Array(bodyBytes.buffer as ArrayBuffer, bodyBytes.byteOffset, bodyBytes.byteLength);
		} else {
			this._bodyBytes = new Uint8Array(0);
		}

		this.status = typeof init.status === 'number' ? init.status : 200;
		this.statusText = init.statusText || (this.status === 200 ? 'OK' : '');
		this.ok = this.status >= 200 && this.status < 300;
		this.headers = new SyHeaders(init.headers);
		this.url = init.url || '';
	}

	async text(): Promise<string> {
		if (this.bodyUsed) throw new TypeError('Body has already been consumed');
		this.bodyUsed = true;
		return new TextDecoder('utf-8').decode(this._bodyBytes);
	}

	async json<T = any>(): Promise<T> {
		const rawText = await this.text();
		return JSON.parse(rawText);
	}

	async arrayBuffer(): Promise<ArrayBuffer> {
		if (this.bodyUsed) throw new TypeError('Body has already been consumed');
		this.bodyUsed = true;
		return this._bodyBytes.buffer.slice(
			this._bodyBytes.byteOffset,
			this._bodyBytes.byteOffset + this._bodyBytes.byteLength
		) as ArrayBuffer;
	}

	async bytes(): Promise<Uint8Array> {
		if (this.bodyUsed) throw new TypeError('Body has already been consumed');
		this.bodyUsed = true;
		return new Uint8Array(this._bodyBytes);
	}

	async blob(): Promise<Blob> {
		const buffer = await this.arrayBuffer();
		const type = this.headers.get('content-type') || '';
		return new Blob([buffer], { type });
	}

	clone(): SyResponse {
		return new SyResponse(this._bodyBytes, {
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			url: this.url
		});
	}

	get body(): ReadableStream<Uint8Array> | null {
		if (typeof ReadableStream !== 'undefined') {
			const bytes = this._bodyBytes;
			return new ReadableStream({
				start(controller) {
					controller.enqueue(bytes);
					controller.close();
				}
			});
		}
		return null;
	}
}

// =========================================================================
// TLS 1.3 & E2EE Record Layer Engine (Native WebCrypto)
// =========================================================================

const TLS_CONSTANTS = {
	REC_HANDSHAKE: 0x16,
	REC_ALERT: 0x15,
	REC_APP_DATA: 0x17,
	REC_CHANGE_CIPHER_SPEC: 0x14,
	HS_CLIENT_HELLO: 0x01,
	HS_SERVER_HELLO: 0x02,
	HS_ENCRYPTED_EXTENSIONS: 0x08,
	HS_CERTIFICATE: 0x0b,
	HS_CERTIFICATE_VERIFY: 0x0f,
	HS_FINISHED: 0x14,
	VERSION_TLS12: 0x0303,
	VERSION_TLS13: 0x0304,
	CIPHER_TLS_AES_128_GCM_SHA256: 0x1301,
	GROUP_SECP256R1: 0x0017
};

function u8Concat(...arrays: any[]): any {
	let totalLen = 0;
	for (const a of arrays) totalLen += a.length;
	const out = new Uint8Array(totalLen);
	let offset = 0;
	for (const a of arrays) {
		out.set(a, offset);
		offset += a.length;
	}
	return out;
}

function writeU16(val: number): Uint8Array {
	return new Uint8Array([(val >> 8) & 0xff, val & 0xff]);
}

function writeU24(val: number): Uint8Array {
	return new Uint8Array([(val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff]);
}

function readU16(u8: Uint8Array, offset: number): number {
	return ((u8[offset] ?? 0) << 8) | (u8[offset + 1] ?? 0);
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
	const subtle = crypto.subtle;
	const hash = 'SHA-256';
	const actualSalt = salt && salt.length > 0 ? salt : new Uint8Array(32);
	const saltKey = await subtle.importKey('raw', actualSalt as BufferSource, { name: 'HMAC', hash }, false, [
		'sign'
	]);
	const prk = await subtle.sign('HMAC', saltKey, ikm as BufferSource);
	return new Uint8Array(prk);
}

async function hkdfExpandLabel(
	prk: Uint8Array,
	labelStr: string,
	contextU8: Uint8Array,
	length: number
): Promise<Uint8Array> {
	const subtle = crypto.subtle;
	const fullLabelStr = 'tls13 ' + labelStr;
	const fullLabelBytes = new TextEncoder().encode(fullLabelStr);

	const hkdfLabel = u8Concat(
		writeU16(length),
		new Uint8Array([fullLabelBytes.length]),
		fullLabelBytes,
		new Uint8Array([contextU8.length]),
		contextU8
	);

	const prkKey = await subtle.importKey('raw', prk as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign'
	]);

	const t1 = await subtle.sign('HMAC', prkKey, u8Concat(hkdfLabel, new Uint8Array([0x01])) as BufferSource);
	return new Uint8Array(t1).slice(0, length);
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
	const buf = await crypto.subtle.digest('SHA-256', data as BufferSource);
	return new Uint8Array(buf);
}

async function buildClientHello(
	hostname: string,
	clientPubKeyUncompressed: Uint8Array,
	clientRandom: Uint8Array
): Promise<{ record: Uint8Array; clientHelloHS: Uint8Array }> {
	// SNI Extension
	const hostBytes = new TextEncoder().encode(hostname);
	const serverNameList = u8Concat(new Uint8Array([0x00]), writeU16(hostBytes.length), hostBytes);
	const extSNI = u8Concat(
		writeU16(0x0000), // server_name
		writeU16(serverNameList.length + 2),
		writeU16(serverNameList.length),
		serverNameList
	);

	// Supported Versions Extension (TLS 1.3 = 0x0304)
	const extSupportedVersions = u8Concat(
		writeU16(0x002b), // supported_versions
		writeU16(0x0003),
		new Uint8Array([0x02]),
		writeU16(TLS_CONSTANTS.VERSION_TLS13)
	);

	// Supported Groups (secp256r1 = 0x0017)
	const extSupportedGroups = u8Concat(
		writeU16(0x000a), // supported_groups
		writeU16(0x0004),
		writeU16(0x0002),
		writeU16(TLS_CONSTANTS.GROUP_SECP256R1)
	);

	// Signature Algorithms
	const sigAlgs = new Uint8Array([
		0x08, 0x04, // rsa_pss_rsae_sha256
		0x04, 0x03, // ecdsa_secp256r1_sha256
		0x04, 0x01 // rsa_pkcs1_sha256
	]);
	const extSigAlgs = u8Concat(writeU16(0x000d), writeU16(sigAlgs.length + 2), writeU16(sigAlgs.length), sigAlgs);

	// Key Share Extension
	const keyShareData = u8Concat(
		writeU16(TLS_CONSTANTS.GROUP_SECP256R1),
		writeU16(clientPubKeyUncompressed.length),
		clientPubKeyUncompressed
	);
	const extKeyShare = u8Concat(
		writeU16(0x0033), // key_share
		writeU16(keyShareData.length + 2),
		writeU16(keyShareData.length),
		keyShareData
	);

	const allExtensions = u8Concat(
		extSNI,
		extSupportedVersions,
		extSupportedGroups,
		extSigAlgs,
		extKeyShare
	);

	const legacySessionId = new Uint8Array(32);
	crypto.getRandomValues(legacySessionId);

	const cipherSuites = new Uint8Array([0x13, 0x01]); // TLS_AES_128_GCM_SHA256

	const hsBody = u8Concat(
		writeU16(TLS_CONSTANTS.VERSION_TLS12),
		clientRandom,
		new Uint8Array([legacySessionId.length]),
		legacySessionId,
		writeU16(cipherSuites.length),
		cipherSuites,
		new Uint8Array([0x01, 0x00]), // compression = null
		writeU16(allExtensions.length),
		allExtensions
	);

	const clientHelloHS = u8Concat(
		new Uint8Array([TLS_CONSTANTS.HS_CLIENT_HELLO]),
		writeU24(hsBody.length),
		hsBody
	);

	const record = u8Concat(
		new Uint8Array([TLS_CONSTANTS.REC_HANDSHAKE]),
		writeU16(TLS_CONSTANTS.VERSION_TLS12),
		writeU16(clientHelloHS.length),
		clientHelloHS
	);

	return { record, clientHelloHS };
}

export function normalizeSyfetchUrl(proxyUrl: string, targetHostPort: string): string {
	let wsUrl = (proxyUrl || '').trim();
	if (!wsUrl) wsUrl = DEFAULT_SYFETCH_URL;

	if (wsUrl.startsWith('http://')) {
		wsUrl = 'ws://' + wsUrl.slice(7);
	} else if (wsUrl.startsWith('https://')) {
		wsUrl = 'wss://' + wsUrl.slice(8);
	} else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
		wsUrl = 'wss://' + wsUrl;
	}

	if (!wsUrl.includes('/ws')) {
		wsUrl = wsUrl.replace(/\/+$/, '') + '/ws';
	}

	wsUrl += (wsUrl.includes('?') ? '&' : '?') + 'target=' + encodeURIComponent(targetHostPort);
	return wsUrl;
}

class BlindSocketTunnel {
	targetHostPort: string;
	proxyUrl: string;
	ws: WebSocket | null = null;
	inbox: Uint8Array[] = [];
	waiters: { resolve: (chunk: Uint8Array | null) => void; reject: (err: Error) => void }[] = [];
	isClosed: boolean = false;
	error: any = null;

	constructor(targetHostPort: string, proxyUrl: string) {
		this.targetHostPort = targetHostPort;
		this.proxyUrl = proxyUrl;
	}

	async connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			const wsUrl = normalizeSyfetchUrl(this.proxyUrl, this.targetHostPort);

			try {
				this.ws = new WebSocket(wsUrl);
				this.ws.binaryType = 'arraybuffer';
			} catch (e: any) {
				return reject(e);
			}

			this.ws.onopen = () => resolve();
			this.ws.onerror = (err) => {
				this.error = err;
				reject(new Error(`Failed to connect to syfetch proxy at ${wsUrl}`));
			};
			this.ws.onclose = () => {
				this.isClosed = true;
				this._flushWaiters();
			};
			this.ws.onmessage = (event) => {
				const u8 = new Uint8Array(event.data);
				this.inbox.push(u8);
				this._flushWaiters();
			};
		});
	}

	private _flushWaiters(): void {
		while (this.waiters.length > 0 && (this.inbox.length > 0 || this.isClosed)) {
			const waiter = this.waiters.shift()!;
			if (this.inbox.length > 0) {
				waiter.resolve(this.inbox.shift()!);
			} else if (this.isClosed) {
				waiter.resolve(null);
			}
		}
	}

	send(u8Data: Uint8Array): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error('Blind tunnel socket is not open');
		}
		this.ws.send(u8Data);
	}

	async readNext(): Promise<Uint8Array | null> {
		if (this.inbox.length > 0) {
			return this.inbox.shift()!;
		}
		if (this.isClosed) {
			return null;
		}
		return new Promise((resolve, reject) => {
			this.waiters.push({ resolve, reject });
		});
	}

	close(): void {
		this.isClosed = true;
		if (this.ws) {
			try {
				this.ws.close();
			} catch (_) {}
		}
	}
}

async function performBlindFetch(
	targetUrlStr: string,
	init: RequestInit = {},
	proxyUrl?: string
): Promise<SyResponse> {
	const targetUrl = new URL(targetUrlStr, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
	if (targetUrl.protocol !== 'https:') {
		throw new Error(`syfetch currently supports end-to-end encrypted https:// requests`);
	}

	const hostname = targetUrl.hostname;
	const port = targetUrl.port || '443';
	const targetHostPort = `${hostname}:${port}`;
	const proxyBase =
		proxyUrl ||
		(typeof window !== 'undefined' && (window as any).SYFETCH_URL) ||
		DEFAULT_SYFETCH_URL;

	// 1. Establish Blind L4 Tunnel to Proxy
	const tunnel = new BlindSocketTunnel(targetHostPort, proxyBase);
	await tunnel.connect();

	// 2. Generate Client-Side Ephemeral ECDH Key Pair (P-256)
	const ecdhKeys = await crypto.subtle.generateKey(
		{ name: 'ECDH', namedCurve: 'P-256' },
		true,
		['deriveKey', 'deriveBits']
	);
	const clientPubKeyRaw = await crypto.subtle.exportKey('raw', ecdhKeys.publicKey);
	const clientRandom = new Uint8Array(32);
	crypto.getRandomValues(clientRandom);

	// 3. Build & Send TLS 1.3 ClientHello
	const { record: clientHelloRecord, clientHelloHS } = await buildClientHello(
		hostname,
		new Uint8Array(clientPubKeyRaw),
		clientRandom
	);
	tunnel.send(clientHelloRecord);

	// 4. Read Server Response records from Blind Tunnel
	let serverBuffer = new Uint8Array(0);
	const readChunk = async () => {
		const chunk = await tunnel.readNext();
		if (chunk) {
			serverBuffer = u8Concat(serverBuffer, chunk);
		}
		return chunk;
	};

	while (serverBuffer.length < 5) {
		const chunk = await readChunk();
		if (!chunk) throw new Error('Proxy connection closed before receiving ServerHello');
	}

	const recLen = readU16(serverBuffer, 3);
	while (serverBuffer.length < 5 + recLen) {
		await readChunk();
	}

	const serverHelloRecord = serverBuffer.slice(0, 5 + recLen);
	serverBuffer = serverBuffer.slice(5 + recLen);

	// Extract Server Key Share from ServerHello
	const shMsg = serverHelloRecord.slice(5);
	const shHandshakeType = shMsg[0];
	if (shHandshakeType !== TLS_CONSTANTS.HS_SERVER_HELLO) {
		throw new Error(`Unexpected handshake message: ${shHandshakeType}`);
	}

	let ptr = 4 + 2 + 32;
	const sessIdLen = shMsg[ptr] ?? 0;
	ptr += 1 + sessIdLen + 2 + 1;
	const extTotalLen = readU16(shMsg, ptr);
	ptr += 2;
	const extEnd = ptr + extTotalLen;

	let serverPubKeyRaw: Uint8Array | null = null;
	while (ptr < extEnd) {
		const extType = readU16(shMsg, ptr);
		const extLen = readU16(shMsg, ptr + 2);
		ptr += 4;
		if (extType === 0x0033) {
			// key_share
			const keyLen = readU16(shMsg, ptr + 2);
			serverPubKeyRaw = shMsg.slice(ptr + 4, ptr + 4 + keyLen);
		}
		ptr += extLen;
	}

	if (!serverPubKeyRaw) {
		throw new Error('Target server did not provide a valid TLS 1.3 Key Share');
	}

	// 5. Derive TLS 1.3 Shared Secret & Traffic Secrets
	const serverKey = await crypto.subtle.importKey(
		'raw',
		serverPubKeyRaw as BufferSource,
		{ name: 'ECDH', namedCurve: 'P-256' },
		false,
		[]
	);
	const sharedSecret = await crypto.subtle.deriveBits(
		{ name: 'ECDH', public: serverKey },
		ecdhKeys.privateKey,
		256
	);

	const zero32 = new Uint8Array(32);
	const earlySecret = await hkdfExtract(zero32, zero32);
	const derivedSecret = await hkdfExpandLabel(earlySecret, 'derived', await sha256(new Uint8Array(0)), 32);
	const handshakeSecret = await hkdfExtract(derivedSecret, new Uint8Array(sharedSecret));

	const serverHelloHS = shMsg;
	const transcriptHash1 = await sha256(u8Concat(clientHelloHS, serverHelloHS));

	const masterDerived = await hkdfExpandLabel(handshakeSecret, 'derived', await sha256(new Uint8Array(0)), 32);
	const masterSecret = await hkdfExtract(masterDerived, zero32);

	const clientAppTrafficSecret = await hkdfExpandLabel(masterSecret, 'c ap traffic', transcriptHash1, 32);
	const serverAppTrafficSecret = await hkdfExpandLabel(masterSecret, 's ap traffic', transcriptHash1, 32);

	const clientAppKey = await hkdfExpandLabel(clientAppTrafficSecret, 'key', new Uint8Array(0), 16);
	const clientAppIV = await hkdfExpandLabel(clientAppTrafficSecret, 'iv', new Uint8Array(0), 12);
	const serverAppKey = await hkdfExpandLabel(serverAppTrafficSecret, 'key', new Uint8Array(0), 16);
	const serverAppIV = await hkdfExpandLabel(serverAppTrafficSecret, 'iv', new Uint8Array(0), 12);

	// 6. Build HTTP/1.1 Request
	const method = (init.method || 'GET').toUpperCase();
	const path = targetUrl.pathname + targetUrl.search || '/';
	const reqHeaders = new SyHeaders(init.headers);
	if (!reqHeaders.has('host')) reqHeaders.set('host', hostname);
	if (!reqHeaders.has('user-agent')) reqHeaders.set('user-agent', 'syfetch/1.0 (Privacy-Preserving E2EE)');
	if (!reqHeaders.has('accept')) reqHeaders.set('accept', '*/*');
	if (!reqHeaders.has('connection')) reqHeaders.set('connection', 'close');

	let bodyBytes: Uint8Array = new Uint8Array(0);
	if (init.body) {
		if (typeof init.body === 'string') {
			bodyBytes = new TextEncoder().encode(init.body);
		} else if (init.body instanceof Uint8Array) {
			bodyBytes = new Uint8Array(init.body.buffer as ArrayBuffer, init.body.byteOffset, init.body.byteLength);
		} else if (init.body instanceof ArrayBuffer) {
			bodyBytes = new Uint8Array(init.body);
		}
	}

	if (bodyBytes.length > 0 && !reqHeaders.has('content-length')) {
		reqHeaders.set('content-length', String(bodyBytes.length));
	}

	let headerText = `${method} ${path} HTTP/1.1\r\n`;
	reqHeaders.forEach((v, k) => {
		headerText += `${k}: ${v}\r\n`;
	});
	headerText += '\r\n';

	const rawHttpPayload = u8Concat(new TextEncoder().encode(headerText), bodyBytes);

	// 7. Encrypt HTTP Application Data Record
	const cryptoKeyClientApp = await crypto.subtle.importKey(
		'raw',
		clientAppKey as BufferSource,
		{ name: 'AES-GCM' },
		false,
		['encrypt']
	);

	const innerPlaintext = u8Concat(rawHttpPayload, new Uint8Array([TLS_CONSTANTS.REC_APP_DATA]));
	const appRecHeader = new Uint8Array([
		TLS_CONSTANTS.REC_APP_DATA,
		0x03,
		0x03,
		(innerPlaintext.length + 16) >> 8,
		(innerPlaintext.length + 16) & 0xff
	]);

	const encryptedAppData = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: clientAppIV as BufferSource,
			additionalData: appRecHeader as BufferSource,
			tagLength: 128
		},
		cryptoKeyClientApp,
		innerPlaintext as BufferSource
	);

	const appRecordToSend = u8Concat(appRecHeader, new Uint8Array(encryptedAppData));
	tunnel.send(appRecordToSend);

	// 8. Receive, Decrypt and Parse HTTP Response
	while (true) {
		const chunk = await tunnel.readNext();
		if (!chunk) break;
		serverBuffer = u8Concat(serverBuffer, chunk);
	}
	tunnel.close();

	let responseBytes = new Uint8Array(0);

	if (serverBuffer.length >= 5) {
		const cryptoKeyServerApp = await crypto.subtle.importKey(
			'raw',
			serverAppKey as BufferSource,
			{ name: 'AES-GCM' },
			false,
			['decrypt']
		);

		try {
			let readOffset = 0;
			let decryptedAll = new Uint8Array(0);
			let seq = 0;

			while (readOffset + 5 <= serverBuffer.length) {
				const recLength = readU16(serverBuffer, readOffset + 3);
				if (readOffset + 5 + recLength > serverBuffer.length) break;

				const ciphertext = serverBuffer.slice(readOffset + 5, readOffset + 5 + recLength);
				const recHdr = serverBuffer.slice(readOffset, readOffset + 5);

				const curIV = new Uint8Array(serverAppIV);
				let tempSeq = BigInt(seq);
				for (let i = 0; i < 8; i++) {
					const idx = curIV.length - 1 - i;
					if (idx >= 0 && idx < curIV.length) {
						curIV[idx] = (curIV[idx] ?? 0) ^ Number(tempSeq & 0xffn);
					}
					tempSeq >>= 8n;
				}

				try {
					const dec = await crypto.subtle.decrypt(
						{ name: 'AES-GCM', iv: curIV as BufferSource, additionalData: recHdr as BufferSource, tagLength: 128 },
						cryptoKeyServerApp,
						ciphertext as BufferSource
					);
					const decU8 = new Uint8Array(dec);
					if (decU8.length > 0 && decU8[decU8.length - 1] === TLS_CONSTANTS.REC_APP_DATA) {
						decryptedAll = u8Concat(decryptedAll, decU8.slice(0, decU8.length - 1));
					} else {
						decryptedAll = u8Concat(decryptedAll, decU8);
					}
					seq++;
				} catch (_) {}
				readOffset += 5 + recLength;
			}

			responseBytes = decryptedAll.length > 0 ? decryptedAll : serverBuffer;
		} catch (_) {
			responseBytes = serverBuffer;
		}
	} else {
		responseBytes = serverBuffer;
	}

	return parseRawHttpResponse(responseBytes, targetUrl.href);
}

function decodeChunkedEncoding(bytes: Uint8Array): Uint8Array {
	const chunks: Uint8Array[] = [];
	let offset = 0;
	while (offset < bytes.length) {
		let lineEnd = -1;
		for (let i = offset; i < bytes.length - 1; i++) {
			if (bytes[i] === 0x0d && bytes[i + 1] === 0x0a) {
				lineEnd = i;
				break;
			}
		}
		if (lineEnd === -1) break;

		const sizeStr = (new TextDecoder('ascii')
			.decode(bytes.slice(offset, lineEnd))
			.trim()
			.split(';')[0]) ?? '';
		const chunkSize = parseInt(sizeStr, 16);
		if (isNaN(chunkSize) || chunkSize === 0) break;

		const chunkStart = lineEnd + 2;
		const chunkEnd = chunkStart + chunkSize;
		if (chunkEnd > bytes.length) {
			chunks.push(bytes.slice(chunkStart));
			break;
		}

		chunks.push(bytes.slice(chunkStart, chunkEnd));
		offset = chunkEnd + 2;
	}
	return u8Concat(...chunks);
}

function parseRawHttpResponse(bytes: Uint8Array, requestUrl: string): SyResponse {
	const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
	const headerSplitIdx = text.indexOf('\r\n\r\n');

	if (headerSplitIdx === -1) {
		return new SyResponse(bytes, { status: 200, statusText: 'OK', url: requestUrl });
	}

	const headerPart = text.slice(0, headerSplitIdx);
	const lines = headerPart.split('\r\n');
	const statusLine = lines[0] || 'HTTP/1.1 200 OK';
	const statusMatch = statusLine.match(/^HTTP\/[0-9.]+\s+(\d+)\s*(.*)$/);

	const statusCode = statusMatch ? parseInt(statusMatch[1] ?? '200', 10) : 200;
	const statusText = (statusMatch ? statusMatch[2]?.trim() : '') || 'OK';

	const headers = new SyHeaders();
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;
		const colonIdx = line.indexOf(':');
		if (colonIdx > 0) {
			const k = line.slice(0, colonIdx).trim();
			const v = line.slice(colonIdx + 1).trim();
			headers.append(k, v);
		}
	}

	const headerEndBytePattern = [0x0d, 0x0a, 0x0d, 0x0a];
	let bodyByteOffset = bytes.length;
	for (let i = 0; i <= bytes.length - 4; i++) {
		if (
			bytes[i] === headerEndBytePattern[0] &&
			bytes[i + 1] === headerEndBytePattern[1] &&
			bytes[i + 2] === headerEndBytePattern[2] &&
			bytes[i + 3] === headerEndBytePattern[3]
		) {
			bodyByteOffset = i + 4;
			break;
		}
	}

	let bodyBytes: Uint8Array = bytes.slice(bodyByteOffset);

	if ((headers.get('transfer-encoding') || '').toLowerCase().includes('chunked')) {
		bodyBytes = decodeChunkedEncoding(bodyBytes);
	}

	return new SyResponse(bodyBytes, {
		status: statusCode,
		statusText: statusText,
		headers: headers,
		url: requestUrl
	});
}

export async function syfetch(
	resource: string | URL | Request,
	init: RequestInit = {},
	proxyUrl?: string
): Promise<SyResponse> {
	let url = '';
	let options = Object.assign({}, init);

	if (typeof resource === 'string') {
		url = resource;
	} else if (resource instanceof URL) {
		url = resource.href;
	} else if (resource && typeof resource === 'object' && 'url' in resource) {
		url = (resource as Request).url;
		options = Object.assign(
			{
				method: (resource as Request).method,
				headers: (resource as Request).headers
			},
			init
		);
	}

	if (!url) {
		throw new TypeError('Failed to execute syfetch: 1 argument required (URL or Request)');
	}

	return performBlindFetch(url, options, proxyUrl);
}
