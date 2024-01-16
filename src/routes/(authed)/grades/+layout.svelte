<script lang="ts">
	import { gradebook, gradebookLoaded } from '$lib/stores';
	import LoadingBanner from '$lib/LoadingBanner.svelte';
	import { loadGradebook } from '$lib/cache';
	import { browser } from '$app/environment';

	if (!$gradebook && browser) loadGradebook();
</script>

<LoadingBanner show={!$gradebookLoaded} loadingMsg="Loading grades..." />

<slot />
