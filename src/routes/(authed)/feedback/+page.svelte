<script>
	import { brand, contactEmail, repoLink } from '$lib/brand';
	import GithubIcon from '@lucide/svelte/icons/github';
	import SendIcon from '@lucide/svelte/icons/send';
	import { Button } from 'flowbite-svelte';
</script>

<svelte:head>
	<title>Feedback - {brand}</title>
</svelte:head>

<h1 class="mx-4 mt-8 text-2xl font-bold">Feedback</h1>

<p class="m-4 dark:text-gray-300">
	If you're experiencing a problem or have suggestions or feedback, please let us know.
</p>

<div class="flex flex-col gap-4 px-4">
	<Button
		href="{repoLink}/issues"
		color="light"
		class="flex max-w-sm flex-row items-center justify-start gap-4 px-4 text-lg dark:text-white"
	>
		<GithubIcon class="h-5 w-5 shrink-0" />Create an issue on GitHub
	</Button>

	<Button
		href="mailto:{contactEmail}"
		color="light"
		class="flex max-w-sm flex-row items-center justify-start gap-4 px-4 text-lg dark:text-white"
	>
		<SendIcon class="h-5 w-5 shrink-0" /> Send us an email
	</Button>
</div>
