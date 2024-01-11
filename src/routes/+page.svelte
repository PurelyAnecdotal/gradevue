<script lang="ts">
	import { goto } from '$app/navigation';
	import { StudentAccount } from '$lib/synergy';
	import { studentAccount } from '$lib/stores';
	import { Card, Button } from 'flowbite-svelte';
	import {
		ChartOutline,
		ClockOutline,
		EyeSlashOutline,
		GithubSolid,
		GridPlusOutline
	} from 'flowbite-svelte-icons';
	import { browser } from '$app/environment';

	if (browser && localStorage.getItem('token')) {
		if (!$studentAccount) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		}

		goto('/grades');
	}
</script>

<div class="p-4 flex flex-col gap-4 items-center justify-center min-h-screen">
	<Card class="w-full sm:w-auto">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">GradeVue</h1>
		<span class="mt-2 font-normal text-gray-700 dark:text-gray-400 leading-tight">
			An improved StudentVue experience.
		</span>
		<div class="mt-4 flex space-x-4">
			<Button href="/login" color="light" class="w-full">Log in</Button>
			<Button href="/signup" class="w-full">Sign up</Button>
		</div>
	</Card>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<Card>
			<h2 class="text-xl dark:text-white mb-2 flex items-center gap-2">
				<EyeSlashOutline class="inline focus:outline-none" />
				Private Login
			</h2>
			<p>
				Unlike SynergyPlus, GradeVue does not have access to your login information. When you use
				GradeVue, your device connects directly to StudentVue. We never see your password or your
				grades!
			</p>
		</Card>

		<Card>
			<h2 class="text-xl dark:text-white mb-2 flex items-center gap-2">
				<GridPlusOutline class="inline focus:outline-none" />
				Hidden Assignments
			</h2>
			<p>
				Unlike SynergyPlus, GradeVue is able to reveal hidden assignments and will factor them into
				your grade calculations. You never have to worry about your grade calculations being
				inaccurate!
			</p>
		</Card>

		<Card>
			<h2 class="text-xl dark:text-white mb-2 flex items-center gap-2">
				<ChartOutline class="inline focus:outline-none" />
				Grade Calculator
			</h2>
			<p>
				GradeVue's powerful Hypothetical Mode allows you to calculate what your grade would be if
				you got a score on an assignment.
			</p>
		</Card>

		<Card>
			<h2 class="text-xl dark:text-white mb-2 flex items-center gap-2">
				<ClockOutline class="inline focus:outline-none" />
				Fast Loading
			</h2>
			<p>
				GradeVue features a modern, responsive design, and is able to load your GradeVue in under
				3 seconds. SynergyPlus takes over 8 seconds to load.
			</p>
		</Card>
	</div>
	<p>and more!</p>
	<Button href="https://github.com/Nonexistent-Name/gradevue" target="_blank" color="light" class="gap-2">
		<GithubSolid class="inline focus:outline-none" />
		Open Source
	</Button>
</div>
