<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { LocalStorageKey } from '$lib';

	interface MigrationResponse {
		success: boolean;
		message: string;
	}

	if (browser && env.PUBLIC_ALLOWED_MIGRATION_ORIGINS !== undefined) {
		const allowedMigrationOrigins = env.PUBLIC_ALLOWED_MIGRATION_ORIGINS.split(',');

		addEventListener('message', ({ origin, data, source }) => {
			if (!allowedMigrationOrigins.includes(origin) || !(data instanceof Map)) return;

			if (localStorage.getItem(LocalStorageKey.token) !== null) {
				const response: MigrationResponse = {
					success: false,
					message: 'Data import failed: Existing data found'
				};
				source?.postMessage(response, { targetOrigin: origin });
				return;
			}

			data.forEach((value, key) => localStorage.setItem(key, value));

			const response: MigrationResponse = {
				success: true,
				message: 'Data import successful'
			};
			source?.postMessage(response, { targetOrigin: origin });
		});
	}
</script>
