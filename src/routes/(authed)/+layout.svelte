<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { Drawer, NavHamburger } from 'flowbite-svelte';
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
		if (localStorage.getItem(LocalStorageKey.token)) loadStudentAccount();
		else goto('/login');
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
		<NavHamburger
			onClick={() => {
				drawerHidden = false;
			}}
			class="ml-0 text-white"
		/>
		<a href="/grades" class="mr-auto text-xl text-white">GradeVue</a>
		<div>{studentInfoState.studentInfo?.FormattedName}</div>
	</div>

	<div class="overflow-y-auto">
		{@render children?.()}
	</div>
</div>
