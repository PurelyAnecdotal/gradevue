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

<div class="hidden md:block md:fixed top-0">
	<AppSidebar />
</div>

<Drawer {transitionParams} bind:hidden={drawerHidden} class="p-0 m-0 w-auto">
	<AppSidebar />
</Drawer>

<div class="md:pt-0 md:pl-64 h-screen flex flex-col">
	<div class="sticky top-0 flex p-2 pr-4 bg-slate-800 md:hidden items-center">
		<NavHamburger onClick={showSidebar} class="text-white ml-0" />
		<a href="/grades" class="mr-auto text-xl text-white">GradeVue</a>
		<div>{$studentInfo?.FormattedName}</div>
	</div>

	<div class="overflow-y-auto">
		{@render children?.()}
	</div>
</div>
