<script>
	import { Card } from 'flowbite-svelte';
	import { GithubSolid } from 'flowbite-svelte-icons';
</script>

<svelte:head>
	<title>Feedback - GradeVue</title>
</svelte:head>

<div class="p-4 flex flex-col items-center justify-center min-h-screen">
	<Card
		href="https://github.com/Nonexistent-Name/gradevue/issues"
		class="flex flex-row items-center gap-4"
	>
		<GithubSolid size="xl" class="focus:outline-none text-white" />
		<h1 class="text-xl text-gray-900 dark:text-white">
			Report an Issue or Suggest a Feature on GitHub
		</h1>
	</Card>
</div>
