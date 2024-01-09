<script lang="ts">
	import { goto } from '$app/navigation';
	import { studentAccount } from '$lib/stores';
	import { StudentAccount } from '$lib/synergy';
	import { sineIn } from 'svelte/easing';
	import { Drawer, Navbar, NavBrand, NavHamburger } from 'flowbite-svelte';
	import AppSidebar from '$lib/AppSidebar.svelte';
	import { navigating } from '$app/stores';

	let drawerHidden = true;

	if (!$studentAccount) {
		if (localStorage.getItem('token')) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		} else goto('/login');
	}

	function showSidebar() {
		drawerHidden = false;
	}

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};

	navigating.subscribe((navigating) => {
		if (navigating) drawerHidden = true;
	});
</script>

<div class="fixed top-0 w-full z-10 md:hidden">
	<Navbar>
		<NavHamburger onClick={showSidebar} />
		<NavBrand href="/grades" class="mr-auto text-xl">Gradebook</NavBrand>
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
