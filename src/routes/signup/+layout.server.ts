import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	if (env.PUBLIC_TARGET_MIGRATION_ORIGIN === undefined) return;
	redirect(308, url.href.replace(url.origin, env.PUBLIC_TARGET_MIGRATION_ORIGIN));
}
