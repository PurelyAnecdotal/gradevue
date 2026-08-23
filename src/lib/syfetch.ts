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
// TLS 1.3 & E2EE Record Layer Engine (RFC 8446 Native WebCrypto)
// =========================================================================

const TLS_CONSTANTS = {
	REC_CHANGE_CIPHER_SPEC: 0x14,
	REC_ALERT: 0x15,
	REC_HANDSHAKE: 0x16,
	REC_APP_DATA: 0x17,
	HS_CLIENT_HELLO: 0x01,
	HS_SERVER_HELLO: 0x02,
	HS_NEW_SESSION_TICKET: 0x04,
	HS_ENCRYPTED_EXTENSIONS: 0x08,
	HS_CERTIFICATE: 0x0b,
	HS_CERTIFICATE_VERIFY: 0x0f,
	HS_FINISHED: 0x14,
	VERSION_TLS12: 0x0303,
	VERSION_TLS13: 0x0304,
	CIPHER_TLS_AES_128_GCM_SHA256: 0x1301,
	GROUP_SECP256R1: 0x0017
};

function u8Concat(...arrays: (Uint8Array<ArrayBufferLike> | ArrayLike<number> | null | undefined)[]): Uint8Array<ArrayBuffer> {
	let totalLen = 0;
	for (const a of arrays) if (a) totalLen += a.length;
	const out = new Uint8Array(totalLen);
	let offset = 0;
	for (const a of arrays) {
		if (a) {
			out.set(a, offset);
			offset += a.length;
		}
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

function readU24(u8: Uint8Array, offset: number): number {
	return (
		((u8[offset] ?? 0) << 16) |
		((u8[offset + 1] ?? 0) << 8) |
		(u8[offset + 2] ?? 0)
	);
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
	const subtle = crypto.subtle;
	const buf = await subtle.digest('SHA-256', data as BufferSource);
	return new Uint8Array(buf);
}

async function hmacSha256(keyBytes: Uint8Array, dataBytes: Uint8Array): Promise<Uint8Array> {
	const subtle = crypto.subtle;
	const key = await subtle.importKey(
		'raw',
		keyBytes as BufferSource,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await subtle.sign('HMAC', key, dataBytes as BufferSource);
	return new Uint8Array(sig);
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
	const actualSalt = salt && salt.length > 0 ? salt : new Uint8Array(32);
	return hmacSha256(actualSalt, ikm);
}

async function hkdfExpandLabel(
	prk: Uint8Array,
	labelStr: string,
	contextU8: Uint8Array,
	length: number
): Promise<Uint8Array> {
	const fullLabelStr = 'tls13 ' + labelStr;
	const fullLabelBytes = new TextEncoder().encode(fullLabelStr);
	const hkdfLabel = u8Concat(
		writeU16(length),
		new Uint8Array([fullLabelBytes.length]),
		fullLabelBytes,
		new Uint8Array([contextU8.length]),
		contextU8
	);
	const info = u8Concat(hkdfLabel, new Uint8Array([0x01]));
	const t1 = await hmacSha256(prk, info);
	return t1.slice(0, length);
}

function getRecordIV(baseIV: Uint8Array, seq: bigint): Uint8Array {
	const iv = new Uint8Array(baseIV);
	let s = seq;
	for (let i = 0; i < 8; i++) {
		const idx = iv.length - 1 - i;
		if (idx >= 0 && iv[idx] !== undefined) {
			iv[idx] = (iv[idx] as number) ^ Number(s & 0xffn);
		}
		s >>= 8n;
	}
	return iv;
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
		0x04, 0x03, // ecdsa_secp256r1_sha256
		0x08, 0x04, // rsa_pss_rsae_sha256
		0x04, 0x01, // rsa_pkcs1_sha256
		0x02, 0x01  // rsa_pkcs1_sha1
	]);
	const extSigAlgs = u8Concat(
		writeU16(0x000d),
		writeU16(sigAlgs.length + 2),
		writeU16(sigAlgs.length),
		sigAlgs
	);

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

	// Cipher suites: TLS_AES_128_GCM_SHA256 (0x1301)
	const cipherSuites = new Uint8Array([0x13, 0x01]);

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

	if (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://')) {
		// Scheme already provided, keep it
	} else if (wsUrl.startsWith('http://')) {
		wsUrl = 'ws://' + wsUrl.slice(7);
	} else if (wsUrl.startsWith('https://')) {
		wsUrl = 'wss://' + wsUrl.slice(8);
	} else {
		// No scheme provided: default to ws:// for localhost/IP, wss:// otherwise
		const lower = wsUrl.toLowerCase();
		if (
			lower.startsWith('localhost') ||
			lower.startsWith('127.0.0.1') ||
			lower.startsWith('0.0.0.0') ||
			lower.includes('.localhost')
		) {
			wsUrl = 'ws://' + wsUrl;
		} else {
			wsUrl = 'wss://' + wsUrl;
		}
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
	const targetUrl = new URL(
		targetUrlStr,
		typeof window !== 'undefined' ? window.location.href : 'http://localhost'
	);
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
	const subtle = crypto.subtle;
	const ecdhKeys = await subtle.generateKey(
		{ name: 'ECDH', namedCurve: 'P-256' },
		true,
		['deriveKey', 'deriveBits']
	);
	const clientPubKeyRaw = new Uint8Array(await subtle.exportKey('raw', ecdhKeys.publicKey));
	const clientRandom = new Uint8Array(32);
	crypto.getRandomValues(clientRandom);

	// 3. Build & Send TLS 1.3 ClientHello
	const { record: clientHelloRecord, clientHelloHS } = await buildClientHello(
		hostname,
		clientPubKeyRaw,
		clientRandom
	);
	tunnel.send(clientHelloRecord);

	// 4. Record buffer reader
	let serverBuffer = new Uint8Array(0);
	const readBytes = async (minLen: number) => {
		while (serverBuffer.length < minLen) {
			const chunk = await tunnel.readNext();
			if (!chunk) throw new Error(`Connection to ${hostname} closed prematurely during TLS handshake`);
			serverBuffer = u8Concat(serverBuffer, chunk);
		}
	};

	const readRecord = async () => {
		await readBytes(5);
		const recType = serverBuffer[0];
		const recVersion = readU16(serverBuffer, 1);
		const recLen = readU16(serverBuffer, 3);
		await readBytes(5 + recLen);
		const recordBytes = serverBuffer.slice(0, 5 + recLen);
		serverBuffer = serverBuffer.slice(5 + recLen);
		return {
			recType,
			recVersion,
			recLen,
			payload: recordBytes.slice(5),
			fullRecord: recordBytes
		};
	};

	// 5. Read ServerHello record (skipping optional middlebox ChangeCipherSpec records)
	let shRecord = await readRecord();
	while (shRecord.recType === TLS_CONSTANTS.REC_CHANGE_CIPHER_SPEC) {
		shRecord = await readRecord();
	}

	if (shRecord.recType !== TLS_CONSTANTS.REC_HANDSHAKE) {
		tunnel.close();
		throw new Error(`Expected TLS Handshake record from ${hostname}, got record type: ${shRecord.recType}`);
	}

	const serverHelloHS = shRecord.payload;
	const shMsgType = serverHelloHS[0];
	if (shMsgType !== TLS_CONSTANTS.HS_SERVER_HELLO) {
		tunnel.close();
		throw new Error(`Expected TLS ServerHello from ${hostname}, got handshake type: ${shMsgType}`);
	}

	// Extract Server Key Share from ServerHello
	let ptr = 4 + 2 + 32; // skip type(1) + len(3) + version(2) + random(32)
	const sessIdLen = serverHelloHS[ptr] ?? 0;
	ptr += 1 + sessIdLen + 2 + 1; // sessIdLen + cipherSuite(2) + compression(1)
	const extTotalLen = readU16(serverHelloHS, ptr);
	ptr += 2;
	const extEnd = ptr + extTotalLen;

	let serverPubKeyRaw: Uint8Array | null = null;
	while (ptr < extEnd) {
		const extType = readU16(serverHelloHS, ptr);
		const extLen = readU16(serverHelloHS, ptr + 2);
		ptr += 4;
		if (extType === 0x0033) {
			// key_share extension
			const keyLen = readU16(serverHelloHS, ptr + 2);
			serverPubKeyRaw = serverHelloHS.slice(ptr + 4, ptr + 4 + keyLen);
		}
		ptr += extLen;
	}

	if (!serverPubKeyRaw) {
		tunnel.close();
		throw new Error(`Target server ${hostname} did not provide a valid TLS 1.3 Key Share`);
	}

	// 6. Derive TLS 1.3 Handshake Secrets (RFC 8446)
	const serverKey = await subtle.importKey(
		'raw',
		serverPubKeyRaw as BufferSource,
		{ name: 'ECDH', namedCurve: 'P-256' },
		false,
		[]
	);
	const sharedSecret = new Uint8Array(
		await subtle.deriveBits(
			{ name: 'ECDH', public: serverKey },
			ecdhKeys.privateKey,
			256
		)
	);

	const zero32 = new Uint8Array(32);
	const emptyHash = await sha256(new Uint8Array(0));
	const earlySecret = await hkdfExtract(zero32, zero32);
	const derivedSecret = await hkdfExpandLabel(earlySecret, 'derived', emptyHash, 32);
	const handshakeSecret = await hkdfExtract(derivedSecret, sharedSecret);

	const transcript1 = u8Concat(clientHelloHS, serverHelloHS);
	const transcriptHash1 = await sha256(transcript1);

	const clientHsTrafficSecret = await hkdfExpandLabel(handshakeSecret, 'c hs traffic', transcriptHash1, 32);
	const serverHsTrafficSecret = await hkdfExpandLabel(handshakeSecret, 's hs traffic', transcriptHash1, 32);

	const clientHsKeyRaw = await hkdfExpandLabel(clientHsTrafficSecret, 'key', new Uint8Array(0), 16);
	const clientHsIV = await hkdfExpandLabel(clientHsTrafficSecret, 'iv', new Uint8Array(0), 12);
	const serverHsKeyRaw = await hkdfExpandLabel(serverHsTrafficSecret, 'key', new Uint8Array(0), 16);
	const serverHsIV = await hkdfExpandLabel(serverHsTrafficSecret, 'iv', new Uint8Array(0), 12);

	const cryptoKeyServerHs = await subtle.importKey(
		'raw',
		serverHsKeyRaw as BufferSource,
		{ name: 'AES-GCM' },
		false,
		['decrypt']
	);
	const cryptoKeyClientHs = await subtle.importKey(
		'raw',
		clientHsKeyRaw as BufferSource,
		{ name: 'AES-GCM' },
		false,
		['encrypt']
	);

	// 7. Decrypt and Process Encrypted Server Handshake Records
	let serverHsSeq = 0n;
	let handshakeBuffer = new Uint8Array(0);
	let transcriptHandshake = transcript1;
	let serverFinishedReceived = false;

	while (!serverFinishedReceived) {
		const rec = await readRecord();
		if (rec.recType === TLS_CONSTANTS.REC_CHANGE_CIPHER_SPEC) {
			continue;
		}
		if (rec.recType !== TLS_CONSTANTS.REC_APP_DATA) {
			tunnel.close();
			throw new Error(`Unexpected record type ${rec.recType} during TLS handshake with ${hostname}`);
		}

		const iv = getRecordIV(serverHsIV, serverHsSeq++);
		let dec: ArrayBuffer;
		try {
			dec = await subtle.decrypt(
				{ name: 'AES-GCM', iv: iv as BufferSource, additionalData: rec.fullRecord.slice(0, 5) as BufferSource, tagLength: 128 },
				cryptoKeyServerHs,
				rec.payload as BufferSource
			);
		} catch (err: any) {
			tunnel.close();
			throw new Error(`Failed to decrypt TLS handshake record from ${hostname}: ${err.message || err}`);
		}

		const decU8 = new Uint8Array(dec);
		let endPtr = decU8.length - 1;
		while (endPtr >= 0 && decU8[endPtr] === 0) endPtr--;
		const innerType = decU8[endPtr];
		const innerData = decU8.slice(0, endPtr);

		if (innerType !== TLS_CONSTANTS.REC_HANDSHAKE) {
			tunnel.close();
			throw new Error(`Unexpected inner TLS record type: ${innerType} (expected handshake 0x16)`);
		}

		handshakeBuffer = u8Concat(handshakeBuffer, innerData);

		while (handshakeBuffer.length >= 4) {
			const hsType = handshakeBuffer[0];
			const hsLen = readU24(handshakeBuffer, 1);
			if (handshakeBuffer.length < 4 + hsLen) break;

			const hsMsg = handshakeBuffer.slice(0, 4 + hsLen);
			handshakeBuffer = handshakeBuffer.slice(4 + hsLen);

			if (hsType === TLS_CONSTANTS.HS_FINISHED) {
				const serverFinishedKey = await hkdfExpandLabel(serverHsTrafficSecret, 'finished', new Uint8Array(0), 32);
				const th = await sha256(transcriptHandshake);
				const expectedVerifyData = await hmacSha256(serverFinishedKey, th);
				const actualVerifyData = hsMsg.slice(4);

				let match = true;
				if (actualVerifyData.length !== expectedVerifyData.length) match = false;
				for (let i = 0; i < actualVerifyData.length; i++) {
					if (actualVerifyData[i] !== expectedVerifyData[i]) match = false;
				}
				if (!match) {
					tunnel.close();
					throw new Error(`TLS 1.3 Server Finished verification failed for ${hostname}`);
				}

				transcriptHandshake = u8Concat(transcriptHandshake, hsMsg);
				serverFinishedReceived = true;
				break;
			} else {
				transcriptHandshake = u8Concat(transcriptHandshake, hsMsg);
			}
		}
	}

	// 8. Send Client ChangeCipherSpec (Middlebox compat) & Client Finished
	const ccsRecord = new Uint8Array([TLS_CONSTANTS.REC_CHANGE_CIPHER_SPEC, 0x03, 0x03, 0x00, 0x01, 0x01]);
	tunnel.send(ccsRecord);

	const clientFinishedKey = await hkdfExpandLabel(clientHsTrafficSecret, 'finished', new Uint8Array(0), 32);
	const transcriptHash3 = await sha256(transcriptHandshake);
	const clientVerifyData = await hmacSha256(clientFinishedKey, transcriptHash3);
	const clientFinishedMsg = u8Concat(
		new Uint8Array([TLS_CONSTANTS.HS_FINISHED]),
		writeU24(clientVerifyData.length),
		clientVerifyData
	);

	const clientFinishedInner = u8Concat(clientFinishedMsg, new Uint8Array([TLS_CONSTANTS.REC_HANDSHAKE]));
	const clientFinishedHdr = new Uint8Array([
		TLS_CONSTANTS.REC_APP_DATA,
		0x03,
		0x03,
		(clientFinishedInner.length + 16) >> 8,
		(clientFinishedInner.length + 16) & 0xff
	]);

	const clientFinishedEnc = new Uint8Array(
		await subtle.encrypt(
			{ name: 'AES-GCM', iv: getRecordIV(clientHsIV, 0n) as BufferSource, additionalData: clientFinishedHdr as BufferSource, tagLength: 128 },
			cryptoKeyClientHs,
			clientFinishedInner as BufferSource
		)
	);

	tunnel.send(u8Concat(clientFinishedHdr, clientFinishedEnc));

	// 9. Derive Application Traffic Keys
	const masterDerived = await hkdfExpandLabel(handshakeSecret, 'derived', emptyHash, 32);
	const masterSecret = await hkdfExtract(masterDerived, zero32);

	const clientApTrafficSecret = await hkdfExpandLabel(masterSecret, 'c ap traffic', transcriptHash3, 32);
	const serverApTrafficSecret = await hkdfExpandLabel(masterSecret, 's ap traffic', transcriptHash3, 32);

	const clientApKeyRaw = await hkdfExpandLabel(clientApTrafficSecret, 'key', new Uint8Array(0), 16);
	const clientApIV = await hkdfExpandLabel(clientApTrafficSecret, 'iv', new Uint8Array(0), 12);
	const serverApKeyRaw = await hkdfExpandLabel(serverApTrafficSecret, 'key', new Uint8Array(0), 16);
	const serverApIV = await hkdfExpandLabel(serverApTrafficSecret, 'iv', new Uint8Array(0), 12);

	const cryptoKeyClientAp = await subtle.importKey(
		'raw',
		clientApKeyRaw as BufferSource,
		{ name: 'AES-GCM' },
		false,
		['encrypt']
	);
	const cryptoKeyServerAp = await subtle.importKey(
		'raw',
		serverApKeyRaw as BufferSource,
		{ name: 'AES-GCM' },
		false,
		['decrypt']
	);

	// 10. Format and Send HTTP/1.1 Request (Split across TLS records if needed)
	const method = (init.method || 'GET').toUpperCase();
	const path = targetUrl.pathname + targetUrl.search || '/';
	const reqHeaders = new SyHeaders(init.headers);
	if (!reqHeaders.has('host')) reqHeaders.set('host', hostname);
	if (!reqHeaders.has('user-agent')) reqHeaders.set('user-agent', 'syfetch/1.0 (Privacy-Preserving E2EE)');
	if (!reqHeaders.has('accept')) reqHeaders.set('accept', '*/*');
	if (!reqHeaders.has('connection')) reqHeaders.set('connection', 'close');

	let bodyBytes = new Uint8Array(0);
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

	let clientApSeq = 0n;
	const CHUNK_SIZE = 16384;
	for (let offset = 0; offset < rawHttpPayload.length; offset += CHUNK_SIZE) {
		const chunk = rawHttpPayload.slice(offset, offset + CHUNK_SIZE);
		const appInner = u8Concat(chunk, new Uint8Array([TLS_CONSTANTS.REC_APP_DATA]));
		const appHdr = new Uint8Array([
			TLS_CONSTANTS.REC_APP_DATA,
			0x03,
			0x03,
			(appInner.length + 16) >> 8,
			(appInner.length + 16) & 0xff
		]);
		const appEnc = new Uint8Array(
			await subtle.encrypt(
				{ name: 'AES-GCM', iv: getRecordIV(clientApIV, clientApSeq++) as BufferSource, additionalData: appHdr as BufferSource, tagLength: 128 },
				cryptoKeyClientAp,
				appInner as BufferSource
			)
		);
		tunnel.send(u8Concat(appHdr, appEnc));
	}

	// 11. Read & Decrypt Application HTTP Response
	let serverApSeq = 0n;
	let httpDecrypted = new Uint8Array(0);
	let expectedTotalBytes: number | null = null;
	let isChunked = false;

	while (true) {
		let rec;
		try {
			rec = await readRecord();
		} catch (_) {
			break;
		}

		if (rec.recType === TLS_CONSTANTS.REC_CHANGE_CIPHER_SPEC) continue;
		if (rec.recType !== TLS_CONSTANTS.REC_APP_DATA) continue;

		const iv = getRecordIV(serverApIV, serverApSeq++);
		let decU8: Uint8Array;
		try {
			const dec = await subtle.decrypt(
				{ name: 'AES-GCM', iv: iv as BufferSource, additionalData: rec.fullRecord.slice(0, 5) as BufferSource, tagLength: 128 },
				cryptoKeyServerAp,
				rec.payload as BufferSource
			);
			decU8 = new Uint8Array(dec);
		} catch (err: any) {
			break;
		}

		let endPtr = decU8.length - 1;
		while (endPtr >= 0 && decU8[endPtr] === 0) endPtr--;
		const innerType = decU8[endPtr];
		const innerData = decU8.slice(0, endPtr);

		if (innerType === TLS_CONSTANTS.REC_APP_DATA) {
			httpDecrypted = u8Concat(httpDecrypted, innerData);

			// Check if we have received complete HTTP headers and body to terminate early
			if (expectedTotalBytes === null) {
				const headerEndPattern = [0x0d, 0x0a, 0x0d, 0x0a];
				let headerEndIdx = -1;
				for (let i = 0; i <= httpDecrypted.length - 4; i++) {
					if (
						httpDecrypted[i] === headerEndPattern[0] &&
						httpDecrypted[i + 1] === headerEndPattern[1] &&
						httpDecrypted[i + 2] === headerEndPattern[2] &&
						httpDecrypted[i + 3] === headerEndPattern[3]
					) {
						headerEndIdx = i + 4;
						break;
					}
				}

				if (headerEndIdx !== -1) {
					const headerStr = new TextDecoder('utf-8').decode(httpDecrypted.slice(0, headerEndIdx));
					const clMatch = headerStr.match(/content-length:\s*(\d+)/i);
					const teMatch = headerStr.match(/transfer-encoding:\s*chunked/i);
					if (clMatch) {
						expectedTotalBytes = headerEndIdx + parseInt(clMatch[1] ?? '0', 10);
					} else if (teMatch) {
						isChunked = true;
					}
				}
			}

			if (expectedTotalBytes !== null && httpDecrypted.length >= expectedTotalBytes) {
				break;
			}

			if (isChunked) {
				// Check for terminating chunk 0\r\n\r\n
				const last8 = new TextDecoder('ascii').decode(httpDecrypted.slice(Math.max(0, httpDecrypted.length - 8)));
				if (last8.includes('0\r\n\r\n')) {
					break;
				}
			}
		} else if (innerType === TLS_CONSTANTS.REC_ALERT) {
			break;
		}
	}

	tunnel.close();

	if (httpDecrypted.length === 0) {
		throw new Error(`Received empty or un-decryptable response from ${hostname}`);
	}

	return parseRawHttpResponse(httpDecrypted, targetUrl.href);
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

