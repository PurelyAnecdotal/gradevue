<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import AppSidebar from '$lib/AppSidebar.svelte';
	import { studentAccount } from '$lib/stores';
	import { StudentAccount } from '$lib/synergy';
	import { Drawer, Navbar, NavBrand, NavHamburger } from 'flowbite-svelte';
	import { onDestroy } from 'svelte';
	import { sineIn } from 'svelte/easing';

	let drawerHidden = true;

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

<div class="fixed top-0 w-full z-10 md:hidden">
	<Navbar>
		<NavHamburger onClick={showSidebar} />
		<NavBrand href="/grades" class="mr-auto text-xl">GradeVue</NavBrand>
	</Navbar>
	<Drawer {transitionParams} bind:hidden={drawerHidden} class="p-0 m-0 w-auto">
		<AppSidebar />
	</Drawer>
</div>

<div class="hidden md:block md:fixed top-0">
	<AppSidebar />
</div>

<main class="pt-16 md:pt-0 md:pl-64 h-screen">
	<slot />
</main>
