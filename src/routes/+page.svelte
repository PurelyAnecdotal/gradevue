<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { brand, repoLink } from '$lib/brand';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import BellDotIcon from '@lucide/svelte/icons/bell-dot';
	import CalculatorIcon from '@lucide/svelte/icons/calculator';
	import ChartLineIcon from '@lucide/svelte/icons/chart-line';
	import GithubIcon from '@lucide/svelte/icons/github';
	import FolderLockIcon from '@lucide/svelte/icons/folder-lock';
	import { Button, Card } from 'flowbite-svelte';

	if (browser && localStorage.getItem(LocalStorageKey.token) !== null) {
		if (!acc.studentAccount) loadStudentAccount();

		void goto('/grades');
	}
</script>

<svelte:head>
	<title>{brand} - An advanced grade calculator</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow flex-col items-center justify-center gap-4 p-4 pb-0">
		<Card class="w-full space-y-4 sm:w-auto">
			<h1
				class="mx-auto flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
			>
				<img src="/favicon.svg" class="h-8 w-8" alt="{brand} icon" />
				{brand}
			</h1>

			<div>
				<p class="font-normal text-gray-700 dark:text-gray-300">
					An advanced grade calculator designed to interface with StudentVUE®.
				</p>
				<p class="mt-2 text-xs">
					StudentVUE is a registered trademark of Edupoint Educational Systems LLC. {brand} is not affiliated
					with or endorsed by Edupoint Educational Systems LLC.
				</p>
			</div>

			<div class="flex gap-4">
				<Button href="/login" color="light" class="w-full">Log in</Button>
				<Button href="/signup" class="w-full">Sign up</Button>
			</div>
		</Card>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Card>
				<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
					<ChartLineIcon class="h-5 w-5" /> Grade Chart
				</h2>
				<p>
					Visually see how your grade has changed over time, how each assignment affects your grade,
					how categories are broken down, and which new assignments have been put in.
				</p>
			</Card>

			<Card>
				<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
					<CalculatorIcon class="h-5 w-5" /> Grade Calculator
				</h2>
				<p>
					{brand}'s powerful Hypothetical Mode let you calculate what your grade would be if you got
					a score on an assignment, what you need to get on your final, and much more.
				</p>
			</Card>

			<Card>
				<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
					<BellDotIcon class="h-5 w-5" /> Attendance and more
				</h2>
				<p>
					{brand} breaks down your attendance by day and shows what periods you missed. It also shows
					your report cards, documents, and mail.
				</p>
			</Card>

			<Card>
				<h2 class="mb-2 flex items-center gap-2 text-xl dark:text-white">
					<FolderLockIcon class="h-5 w-5" /> Private Login
				</h2>
				<p>
					{brand} does not have access to your data. When you use {brand}, your device connects
					directly to your student portal. We never see your password or your grades!
					<a href="/privacy" class="text-primary-600 underline">Learn more</a>
				</p>
			</Card>
		</div>

		<Button href={repoLink} target="_blank" color="light" class="gap-2">
			<GithubIcon class="h-5 w-5" /> Open Source
		</Button>
	</main>

	<Disclaimer />
</div>
