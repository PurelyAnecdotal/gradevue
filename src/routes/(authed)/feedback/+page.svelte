<script>
	import { Card } from 'flowbite-svelte';
	import GithubSolid from 'flowbite-svelte-icons/GithubSolid.svelte';
	import EnvelopeOutline from 'flowbite-svelte-icons/EnvelopeOutline.svelte';
</script>

<svelte:head>
	<title>Feedback - GradeVue</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
	<Card
		href="https://github.com/Nonexistent-Name/gradevue/issues"
		class="flex flex-row items-center gap-4"
	>
		<GithubSolid size="xl" class="text-white focus:outline-none" />
		<h1 class="text-xl text-gray-900 dark:text-white">
			Report an issue or suggest a feature on GitHub
		</h1>
	</Card>

	<Card href="mailto:hello@gradevue.org" class="flex flex-row items-center gap-4">
		<EnvelopeOutline size="xl" class="text-white focus:outline-none" />
		<h1 class="text-xl text-gray-900 dark:text-white">Send us an email</h1>
	</Card>
</div>
