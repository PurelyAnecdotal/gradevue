<script lang="ts">
	import { browser } from '$app/environment';
	import LoadingBanner from '$lib/LoadingBanner.svelte';
	import { loadGradebook } from '$lib/cache';
	import { gradebook, gradebookLoaded } from '$lib/stores';

	if (!$gradebook && browser) loadGradebook();
</script>

<LoadingBanner show={!$gradebookLoaded} loadingMsg="Loading grades..." />

<slot />
