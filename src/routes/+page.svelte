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
	import FolderLockIcon from '@lucide/svelte/icons/folder-lock';
	import GithubIcon from '@lucide/svelte/icons/github';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	if (browser && localStorage.getItem(LocalStorageKey.token) !== null) {
		if (!acc.studentAccount) loadStudentAccount();

		void goto('/grades');
	}

	const features = [
		{
			icon: ChartLineIcon,
			title: 'Grade Chart',
			description:
				'Visually see how your grade has changed over time, how each assignment affects your grade, how categories are broken down, and which new assignments have been put in.'
		},
		{
			icon: CalculatorIcon,
			title: 'Grade Calculator',
			description: `${brand}'s powerful Hypothetical Mode let you calculate what your grade would be if you got a score on an assignment, what you need to get on your final, and much more.`
		},
		{
			icon: BellDotIcon,
			title: 'Attendance and more',
			description: `${brand} breaks down your attendance by day and shows what periods you missed. It also shows your report cards, documents, and mail.`
		},
		{
			icon: FolderLockIcon,
			title: 'Private Login',
			description: `${brand} does not have access to your data. When you use ${brand}, your device connects directly to your student portal. We never see your password or your grades! `,
			link: { href: '/privacy', text: 'Learn more' }
		}
	];
</script>

<svelte:head>
	<title>{brand} - An advanced grade calculator</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow flex-col items-center justify-center gap-4 p-4 pb-0">
		<Card.Root class="max-w-sm">
			<Card.Header>
				<Card.Title class="mx-auto flex items-center gap-2 text-2xl font-bold tracking-tight">
					<img src="/favicon.svg" class="h-8 w-8" alt="{brand} icon" />
					{brand}
				</Card.Title>
			</Card.Header>

			<Card.Content>
				<p>An advanced grade calculator designed to interface with StudentVUE®.</p>

				<p class="text-muted-foreground mt-2 text-xs">
					StudentVUE is a registered trademark of Edupoint Educational Systems LLC. {brand} is not affiliated
					with or endorsed by Edupoint Educational Systems LLC.
				</p>
			</Card.Content>

			<Card.Footer class="flex gap-2">
				<Button href="/login" size="lg" variant="card" class="flex-1">Log in</Button>
				<Button href="/signup" size="lg" class="flex-1">Sign up</Button>
			</Card.Footer>
		</Card.Root>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each features as { icon: Icon, title, description, link } (title)}
				<Card.Root class="max-w-sm">
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-xl">
							<Icon class="h-5 w-5" />
							{title}
						</Card.Title>
					</Card.Header>
					<Card.Content class="text-tertiary-foreground">
						{description}
						{#if link}
							<a href={link.href} class="text-foreground underline">{link.text}</a>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<Button href={repoLink} target="_blank" variant="outline">
			<GithubIcon class="h-5 w-5" /> Open Source
		</Button>
	</main>

	<Disclaimer />
</div>
