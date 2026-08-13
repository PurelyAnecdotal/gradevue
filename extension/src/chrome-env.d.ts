export {};

declare global {
	const chrome: {
		runtime: {
			lastError?: { message: string };
			onMessage: {
				addListener(
					callback: (
						message: unknown,
						sender: { url?: string; tab?: { url?: string } },
						sendResponse: (response: unknown) => void
					) => boolean | void
				): void;
			};
			sendMessage: (message: unknown, responseCallback: (response: unknown) => void) => void;
		};
		permissions: {
			request(permissions: { origins?: string[] }): Promise<boolean>;
			contains(permissions: { origins?: string[] }): Promise<boolean>;
		};
		tabs: {
			create(createProperties: { url: string; active?: boolean }): Promise<{ id?: number }>;
		};
	};
}
