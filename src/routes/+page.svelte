<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { studentAccount } from '$lib/stores';
	import { StudentAccount } from '$lib/synergy';
	import { Button, Card } from 'flowbite-svelte';
	import ChartOutline from 'flowbite-svelte-icons/ChartOutline.svelte';
	import ClockOutline from 'flowbite-svelte-icons/ClockOutline.svelte';
	import EyeSlashOutline from 'flowbite-svelte-icons/EyeSlashOutline.svelte';
	import GithubSolid from 'flowbite-svelte-icons/GithubSolid.svelte';
	import GridPlusOutline from 'flowbite-svelte-icons/GridPlusOutline.svelte';

	if (browser && localStorage.getItem('token')) {
		if (!$studentAccount) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		}

		goto('/grades');
	}
</script>

<svelte:head>
	<title>Gradevue - The best way to check your grades on StudentVue</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
	<Card class="w-full sm:w-auto">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">GradeVue</h1>
		<p class="mt-2 font-normal text-gray-700 dark:text-gray-400">
			An better way to view your grades on StudentVue that shows all of your Synergy information in
			one place.
		</p>
		<div class="mt-4 flex space-x-4">
			<Button href="/login" color="light" class="w-full">Log in</Button>
			<Button href="/signup" class="w-full">Sign up</Button>
		</div>
	</Card>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<Card>
			<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
				<ChartOutline class="inline focus:outline-none" />
				Grade Calculator
			</h2>
			<p>
				GradeVue's powerful Hypothetical Mode allows you to calculate what your grade would be if
				you got a score on an assignment, as well as how each assignment affects your grade.
			</p>
		</Card>
		<Card>
			<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
				<GridPlusOutline class="inline focus:outline-none" />
				Shows Hidden Assignments
			</h2>
			<p>
				GradeVue is able to reveal hidden assignments and will factor them into your grade
				calculations. You never have to worry about your grade calculations being inaccurate!
			</p>
		</Card>
		<Card>
			<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
				<EyeSlashOutline class="inline focus:outline-none" />
				Private Login
			</h2>
			<p>
				GradeVue does not have access to your login information. When you use GradeVue, your device
				connects directly to StudentVue. We never see your password or your grades!
				<a href="/privacy" class="text-primary-600 underline">Learn more</a>
			</p>
		</Card>
		<Card>
			<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
				<ClockOutline class="inline focus:outline-none" />
				Attendance and more
			</h2>
			<p>
				GradeVue breaks down your attendance by day and shows what periods you missed. It also shows
				your report cards, documents, and messages.
			</p>
		</Card>
	</div>

	<Button
		href="https://github.com/Nonexistent-Name/gradevue"
		target="_blank"
		color="light"
		class="gap-2"
	>
		<GithubSolid class="inline focus:outline-none" />
		Open Source
	</Button>
</div>
