<script lang="ts">
	let { children } = $props();
</script>

<div class="relative rounded-lg border border-gray-600 bg-gray-800 text-gray-100 shadow-md">
	<div class="px-3 py-2 w-max max-w-64">{@render children?.()}</div>
	<div
		class="pointer-events-none absolute bottom-0 left-1/2 block h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 -rotate-45 transform border-b border-l border-inherit bg-inherit text-inherit"
	></div>
</div>
