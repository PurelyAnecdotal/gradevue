<script lang="ts">
	import { Alert } from 'flowbite-svelte';

	interface Props {
		error: unknown;
		reset: () => void;
	}

	const { error, reset }: Props = $props();

    let viewError = $state(false);

    function toggleViewError() {
        viewError = !viewError;
    }
</script>

<div class="flex min-h-screen w-full items-center justify-center p-2">
	<Alert color="red" class="max-w-full space-y-4 border-t-4" rounded={false}>
		<h1 class="text-lg font-bold">Something went wrong.</h1>

		<p>
			Try <button onclick={reset} class="cursor-pointer underline">refreshing</button> the page. If
			the problem persists, please
			<a href="/feedback" class="underline" data-sveltekit-reload>contact us</a>.
		</p>

		<button class="cursor-pointer text-xs text-slate-500 underline" onclick={toggleViewError}>
			{viewError ? 'Hide' : 'Show'} error details
		</button>

		{#if viewError}
			<p class="font-mono wrap-break-word">
				{error instanceof Error ? error.message : JSON.stringify(error)}
			</p>
		{/if}
	</Alert>
</div>
