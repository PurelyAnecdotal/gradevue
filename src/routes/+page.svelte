<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { brand, repoLink } from '$lib/brand';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { demoState, openDemo } from '$lib/demo/demo.svelte';
	import BellDotIcon from '@lucide/svelte/icons/bell-dot';
	import CalculatorIcon from '@lucide/svelte/icons/calculator';
	import ChartLineIcon from '@lucide/svelte/icons/chart-line';
	import FolderLockIcon from '@lucide/svelte/icons/folder-lock';
	import GithubIcon from '@lucide/svelte/icons/github';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import PlayIcon from '@lucide/svelte/icons/play';
	import PuzzleIcon from '@lucide/svelte/icons/puzzle';

	if (browser && localStorage.getItem(LocalStorageKey.token) !== null && !demoState.enabled) {
		if (!acc.studentAccount) loadStudentAccount();

		void goto('/grades');
	}

	const features = [
		{
			icon: ChartLineIcon,
			title: 'Grade Chart',
			description:
				'You could visually see how your grade changed over time, how each assignment affected your grade, how categories were broken down, and which new assignments were put in.'
		},
		{
			icon: CalculatorIcon,
			title: 'Grade Calculator',
			description: `${brand}'s powerful Hypothetical Mode let you calculate what your grade would be if you got a score on an assignment, what you needed to have gotten on your final, and much more.`
		},
		{
			icon: BellDotIcon,
			title: 'Attendance and more',
			description: `${brand} broke down your attendance by day and showed what periods you missed. It also showed your report cards, documents, and mail.`
		},
		{
			icon: FolderLockIcon,
			title: 'Private Login',
			description: `${brand} does not have access to your data. You log in on the official student portal; the companion extension keeps cookies in the browser and GradeCompass processes grades on-device.`,
			link: { href: '/privacy', text: 'Learn more' }
		}
	];
</script>

<svelte:head>
	<title>{brand} - An advanced grade calculator</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div class="m-4 flex grow flex-col items-center gap-4">
		<div
			class="xs:gap-0 flex flex-col-reverse items-center gap-4 perspective-normal xl:m-8 xl:my-16 xl:flex-row xl:gap-4"
		>
			<main
				class="xs:relative xs:-top-16 xs:-mb-16 z-10 flex flex-col items-center gap-4 xl:static xl:top-0 xl:z-0 xl:mb-0"
			>
				<Card.Root class="xs:shadow-lg max-w-sm xl:shadow-sm">
					<Card.Header>
						<Card.Title class="mx-auto flex items-center gap-2 text-2xl font-bold tracking-tight">
							<img src="/favicon.svg" class="h-8 w-8" alt="{brand} icon" />
							{brand}
						</Card.Title>
					</Card.Header>

					<Card.Content>
						<p>An advanced grade calculator.</p>

						<Alert.Root class="mt-4">
							<PuzzleIcon />
							<Alert.Title>StudentVUE login needs the companion extension</Alert.Title>
							<Alert.Description>
								The old portal protocol is gone. Install the companion extension to log in
								on-device, or try the demo.
								<p>
									<a href="/obsolete" class="underline">Learn more</a>
								</p>
							</Alert.Description>
						</Alert.Root>
					</Card.Content>

					<Card.Footer class="flex gap-2">
						<Button size="lg" variant="card" class="flex-1" href="/login">
							<LogInIcon /> Log in
						</Button>
						<Button size="lg" variant="outline" class="flex-1" onclick={openDemo}>
							<PlayIcon /> Try demo
						</Button>
					</Card.Footer>
				</Card.Root>

				<Button href={repoLink} target="_blank" variant="outline">
					<GithubIcon class="h-5 w-5" /> Open Source
				</Button>
			</main>

			<div
				class="border-primary-foreground xs:rotate-x-1 max-w-4xl flex-1 overflow-hidden rounded-xl border-2 shadow-sm xl:max-w-4xl xl:-translate-x-6 xl:scale-90 xl:rotate-x-1 xl:-rotate-y-5 xl:shadow-lg"
			>
				{#snippet demoImage(dark: boolean)}
					<img
						src="/demo_{dark ? 'dark' : 'light'}.webp"
						class={dark ? 'hidden dark:block' : 'dark:hidden'}
						width="2268"
						height="1620"
						alt="GradeCompass class page demonstrating hypothetical mode"
					/>
				{/snippet}

				{@render demoImage(false)}
				{@render demoImage(true)}
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
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
	</div>
</div>
