<script>
	import { brand } from '$lib';
	import { Card } from 'flowbite-svelte';
	import EnvelopeOutline from 'flowbite-svelte-icons/EnvelopeOutline.svelte';
	import GithubSolid from 'flowbite-svelte-icons/GithubSolid.svelte';
</script>

<svelte:head>
	<title>Feedback - {brand}</title>
</svelte:head>

<h1 class="mx-4 mt-8 text-2xl font-bold">Feedback</h1>

<p class="m-4 text-gray-300">
	If you're experiencing a problem or have suggestions or feedback, please let us know.
</p>

<div class="flex flex-col gap-4 px-4">
	<Card
		href="https://github.com/Nonexistent-Name/gradevue/issues"
		class="flex flex-row items-center gap-4"
		padding="sm"
	>
		<GithubSolid size="lg" class="text-white" />
		<h1 class="text-lg text-gray-900 dark:text-white">Create an issue on GitHub</h1>
	</Card>

	<Card href="mailto:hello@gradevue.org" class="flex flex-row items-center gap-4" padding="sm">
		<EnvelopeOutline size="lg" class="text-white" />
		<h1 class="text-lg text-gray-900 dark:text-white">Send an email</h1>
	</Card>
</div>
