<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { studentAccount } from '$lib/stores';
	import { StudentAccount } from '$lib/synergy';

	import { OpenBookSolid, ArrowRightToBracketSolid } from 'flowbite-svelte-icons';
	import {
		Sidebar,
		SidebarBrand,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';

	if (!$studentAccount) {
		if (localStorage.getItem('token')) {
			const { username, password, domain } = JSON.parse(localStorage.getItem('token') ?? '{}');
			$studentAccount = new StudentAccount(domain, username, password);
		} else goto('/login');
	}
</script>

<div class="flex">
	<Sidebar activeUrl={$page.url.pathname} class="flex-none h-screen">
		<SidebarWrapper class="h-screen flex flex-col justify-between">
			<SidebarGroup>
				<SidebarBrand
					site={{
						name: 'Gradebook',
						href: '/grades',
						img: '/favicon.ico'
					}}
				/>
				<SidebarItem label="Grades" href="/grades">
					<svelte:fragment slot="icon">
						<OpenBookSolid />
					</svelte:fragment>
				</SidebarItem>
			</SidebarGroup>
			<SidebarGroup>
				<SidebarItem on:click={() => localStorage.clear()} label="Log Out" href="/login" class="mt-auto">
					<svelte:fragment slot="icon">
						<ArrowRightToBracketSolid />
					</svelte:fragment>
				</SidebarItem>
			</SidebarGroup>
		</SidebarWrapper>
	</Sidebar>

	<main class="w-full h-screen overflow-scroll"><slot /></main>
</div>
