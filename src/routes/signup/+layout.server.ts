import { TARGET_MIGRATION_ORIGIN } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	redirect(308, url.href.replace(url.origin, TARGET_MIGRATION_ORIGIN));
}
