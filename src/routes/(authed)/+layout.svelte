<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { brand, LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import BoundaryFailure from '$lib/components/BoundaryFailure.svelte';
	import { Drawer, NavHamburger, Spinner } from 'flowbite-svelte';
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
				class="ml-0 cursor-pointer text-white"
			/>
			<a href="/grades" class="mr-auto text-xl text-white">{brand}</a>
			<div>{studentInfoState.data?.FormattedName}</div>
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
				<div class="mt-auto flex w-full justify-center gap-1 p-4 text-xs text-gray-600">
					<a href="/feedback" class="text-gray-500">Report an issue</a> •
					<a href="/feedback" class="text-gray-500">Suggest a feature</a> •
					<a href="/feedback" class="text-gray-500">Provide feedback</a>
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
