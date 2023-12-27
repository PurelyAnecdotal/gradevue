<script lang="ts">
	import { goto } from '$app/navigation';
	import { studentAccount } from '$lib/stores';
	import { StudentAccount } from '$lib/synergy';
	import { sineIn } from 'svelte/easing';

	import { Drawer, Navbar, NavBrand, NavHamburger } from 'flowbite-svelte';
	import AppSidebar from '$lib/AppSidebar.svelte';

	let sidebarHidden = true;

	if (!$studentAccount) {
		if (localStorage.getItem('token')) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		} else goto('/login');
	}

	function showSidebar() {
		sidebarHidden = false;
	}

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};
</script>

<div class="md:hidden">
	<Drawer {transitionParams} bind:hidden={sidebarHidden} class="p-0 m-0 w-auto">
		<AppSidebar />
	</Drawer>
</div>
<div class="md:flex">
	<div class="hidden md:block">
		<AppSidebar />
	</div>
	<div class="md:hidden">
		<Navbar>
			<NavHamburger onClick={showSidebar}></NavHamburger>
			<NavBrand href="/grades" class="mr-auto">
				<span class="text-xl">Gradebook</span>
			</NavBrand>
		</Navbar>
	</div>

	<main class="w-full h-screen overflow-scroll"><slot /></main>
</div>
