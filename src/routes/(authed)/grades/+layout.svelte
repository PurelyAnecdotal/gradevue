<script lang="ts">
	import { browser } from '$app/environment';
	import { loadGradebook } from '$lib/cache';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { gradebook, gradebookLoaded } from '$lib/stores';

	let { children } = $props();

	if (!$gradebook && browser) loadGradebook();
</script>

<LoadingBanner show={!$gradebookLoaded} loadingMsg="Loading grades..." />

{@render children?.()}
