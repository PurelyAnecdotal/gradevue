<script>
	import { page } from '$app/stores';
	import {
		Sidebar,
		SidebarWrapper,
		SidebarGroup,
		SidebarBrand,
		SidebarItem
	} from 'flowbite-svelte';
	import {
		ArrowRightToBracketSolid,
		BellOutline,
		AdressBookOutline,
		UserCircleOutline,
		FileLinesOutline,
		FolderOpenOutline
	} from 'flowbite-svelte-icons';
	import { studentInfo } from './stores';
	import { loadStudentInfo } from './cache';
	import { browser } from '$app/environment';

	function logOut() {
		localStorage.clear();
		location.assign('/login');
	}

	if (!$studentInfo && browser) loadStudentInfo();
</script>

<Sidebar activeUrl={$page.url.pathname} class="h-screen">
	<SidebarWrapper class="h-screen flex flex-col justify-between">
		<SidebarGroup>
			<SidebarBrand
				site={{
					name: 'GradeVue',
					href: '/grades',
					img: '/favicon.ico'
				}}
			/>

			<SidebarItem label="Grades" href="/grades">
				<svelte:fragment slot="icon">
					<AdressBookOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem label="Attendance" href="/attendance">
				<svelte:fragment slot="icon">
					<BellOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem label="Report Cards" href="/reportcards">
				<svelte:fragment slot="icon">
					<FileLinesOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem label="Documents" href="/documents">
				<svelte:fragment slot="icon">
					<FolderOpenOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>

		<SidebarGroup>
			<SidebarItem label={$studentInfo?.FormattedName ?? ''} href="/studentinfo">
				<svelte:fragment slot="icon">
					<UserCircleOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem on:click={logOut} label="Log Out" href="/login">
				<svelte:fragment slot="icon">
					<ArrowRightToBracketSolid class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
