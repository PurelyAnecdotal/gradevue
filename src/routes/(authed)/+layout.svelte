<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { studentAccount, studentInfo } from '$lib/stores';
	import { StudentAccount } from '$lib/synergy';
	import { Drawer, NavHamburger } from 'flowbite-svelte';
	import { onDestroy } from 'svelte';
	import { sineIn } from 'svelte/easing';
	import AppSidebar from './AppSidebar.svelte';

	let { children } = $props();

	let drawerHidden = $state(true);

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};

	const showSidebar = () => {
		drawerHidden = false;
	};

	const navigationUnsubscribe = navigating.subscribe((navigating) => {
		if (navigating) drawerHidden = true;
	});

	onDestroy(navigationUnsubscribe);

	if (browser && !$studentAccount) {
		if (localStorage.getItem('token')) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		} else goto('/login');
	}
</script>

<div class="top-0 hidden md:fixed md:block">
	<AppSidebar />
</div>

<Drawer {transitionParams} bind:hidden={drawerHidden} class="m-0 w-auto p-0">
	<AppSidebar />
</Drawer>

<div class="flex h-screen flex-col md:pl-64 md:pt-0">
	<div class="sticky top-0 flex items-center bg-slate-800 p-2 pr-4 md:hidden">
		<NavHamburger onClick={showSidebar} class="ml-0 text-white" />
		<a href="/grades" class="mr-auto text-xl text-white">GradeVue</a>
		<div>{$studentInfo?.FormattedName}</div>
	</div>

	<div class="overflow-y-auto">
		{@render children?.()}
	</div>
</div>
