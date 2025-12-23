<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { brand, LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import BoundaryFailure from '$lib/components/BoundaryFailure.svelte';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import { migrateData } from '$lib/migrate';
	import { Alert, Button, Drawer, NavHamburger, Spinner } from 'flowbite-svelte';
	import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
	import FolderArrowRightOutline from 'flowbite-svelte-icons/FolderArrowRightOutline.svelte';
	import { sineIn } from 'svelte/easing';
	import AppSidebar from './AppSidebar.svelte';
	import { studentInfoState } from './studentinfo/studentInfo.svelte';

	let { children } = $props();

	let drawerHidden = $state(true);

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};

	$effect(() => {
		if (navigating.to !== null) drawerHidden = true;
	});

	if (browser && !acc.studentAccount) {
		if (localStorage.getItem(LocalStorageKey.token) !== null) {
			loadStudentAccount();
		} else {
			void goto('/login');
		}
	}

	let migrationComplete = $state(false);

	if (browser) {
		migrationComplete = localStorage.getItem(LocalStorageKey.migrationComplete) === 'true';
	}

	const targetMigrationOrigin = env.PUBLIC_TARGET_MIGRATION_ORIGIN;

	function migrate() {
		migrateData(page.url.origin, targetMigrationOrigin).then(() => {
			localStorage.setItem(LocalStorageKey.migrationComplete, 'true');
			migrationComplete = true;
		});
	}
</script>

<svelte:boundary>
	<div class="top-0 hidden md:fixed md:block">
		<AppSidebar />
	</div>

	<Drawer {transitionParams} bind:hidden={drawerHidden} class="m-0 w-auto p-0">
		<AppSidebar />
	</Drawer>

	<div class="flex h-screen flex-col md:pt-0 md:pl-64">
		<div class="sticky top-0 flex items-center bg-slate-800 p-2 pr-4 md:hidden">
			<NavHamburger
				onClick={() => {
					drawerHidden = false;
				}}
				class="m-0 cursor-pointer text-white"
			/>
			<a
				href="/grades"
				class="mr-auto ml-1 flex items-center gap-2 text-xl font-semibold tracking-tight whitespace-nowrap dark:text-white"
			>
				<img src="/favicon.svg" class="h-6 sm:h-7" alt={brand} />
				{brand}
			</a>
			<div class="hidden sm:block">{studentInfoState.data?.FormattedName}</div>
		</div>

		<div class="flex flex-1 flex-col overflow-y-auto">
			<div class="flex-1">
				<svelte:boundary>
					{@render children?.()}

					{#snippet pending()}
						{@render fullPageSpinner()}
					{/snippet}

					{#snippet failed(error, reset)}
						<BoundaryFailure {error} {reset} />
					{/snippet}
				</svelte:boundary>
			</div>

			{#if page.url.pathname !== '/feedback'}
				<div class="mt-auto w-full text-xs">
					<div class="mx-auto w-fit p-4 pb-0 dark:text-gray-600">
						<a href="/feedback" class="text-gray-500">Report an issue</a> •
						<a href="/feedback" class="text-gray-500">Suggest a feature</a> •
						<a href="/feedback" class="text-gray-500">Provide feedback</a>
					</div>

					<Disclaimer trademark={false} />
				</div>
			{/if}
		</div>
	</div>

	{#snippet failed(error, reset)}
		<BoundaryFailure {error} {reset} />
	{/snippet}
</svelte:boundary>

{#snippet fullPageSpinner()}
	<div class="flex min-h-screen w-full items-center justify-center">
		<Spinner />
	</div>
{/snippet}

<Alert color="dark" border class="absolute right-0 bottom-0 m-4 max-w-96 space-y-2">
	<h2 class="text-white">GradeVue is now {brand}.</h2>
	<p class="text-xs text-gray-400">We're moving to a new domain to reflect this change.</p>
	{#if !migrationComplete}
		<Button
			onclick={migrate}
			color="light"
			class="mx-auto flex w-fit cursor-pointer items-center gap-1"
		>
			<FolderArrowRightOutline />
			Transfer my data
		</Button>
	{:else}
		<Button
			href={page.url.href.replace(page.url.origin, targetMigrationOrigin)}
			color="light"
			class="mx-auto flex w-fit cursor-pointer items-center gap-1"
		>
			<ArrowRightOutline />
			Go to gradecompass.org
		</Button>
	{/if}
</Alert>
