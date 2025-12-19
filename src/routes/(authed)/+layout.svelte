<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { brand, LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import BoundaryFailure from '$lib/components/BoundaryFailure.svelte';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import { Alert, CloseButton, Drawer, NavHamburger, Spinner } from 'flowbite-svelte';
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

	let showRebrandAlert = $state();
	function dismissRebrandAlert() {
		showRebrandAlert = false;
		localStorage.setItem(LocalStorageKey.dismissedRebrandAlert, 'true');
	}

	if (browser) {
		showRebrandAlert = localStorage.getItem(LocalStorageKey.dismissedRebrandAlert) === null;
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

{#if showRebrandAlert && Date.now() < 1766612675146}
	<Alert color="dark" border class="absolute right-0 bottom-0 m-4 flex max-w-96 items-center">
		<div>
			GradeVue is now {brand}.
			<p class="text-xs text-gray-400">
				In the next few days, we'll be moving to a new domain to reflect this change.
			</p>
		</div>
		<CloseButton onclick={dismissRebrandAlert} class="-my-1.5 ms-auto -me-1.5 cursor-pointer" />
	</Alert>
{/if}
