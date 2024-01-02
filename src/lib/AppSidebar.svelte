<script>
	import { page } from '$app/stores';
	import {
		Sidebar,
		SidebarWrapper,
		SidebarGroup,
		SidebarBrand,
		SidebarItem
	} from 'flowbite-svelte';
	import { ArrowRightToBracketSolid, BellOutline, AdressBookOutline } from 'flowbite-svelte-icons';

	function logOut() {
		localStorage.clear();
		location.assign('/login');
	}
</script>

<Sidebar activeUrl={$page.url.pathname} class="h-screen">
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
					<AdressBookOutline />
				</svelte:fragment>
			</SidebarItem>
			<SidebarItem label="Attendance" href="/attendance">
				<svelte:fragment slot="icon">
					<BellOutline />
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
		<SidebarGroup>
			<SidebarItem on:click={logOut} label="Log Out" href="/login">
				<svelte:fragment slot="icon">
					<ArrowRightToBracketSolid />
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
