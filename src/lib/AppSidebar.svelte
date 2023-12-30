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
</script>

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
			<SidebarItem
				on:click={() => localStorage.clear()}
				label="Log Out"
				href="/login"
				class="mt-auto"
			>
				<svelte:fragment slot="icon">
					<ArrowRightToBracketSolid />
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
