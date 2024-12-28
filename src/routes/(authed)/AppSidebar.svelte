<script lang="ts">
	import { page } from '$app/state';
	import { removeClassID } from '$lib';
	import {
		Badge,
		Sidebar,
		SidebarBrand,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import AddressBookOutline from 'flowbite-svelte-icons/AddressBookOutline.svelte';
	import AnnotationOutline from 'flowbite-svelte-icons/AnnotationOutline.svelte';
	import ArrowRightToBracketOutline from 'flowbite-svelte-icons/ArrowRightToBracketOutline.svelte';
	import BellOutline from 'flowbite-svelte-icons/BellOutline.svelte';
	import ChevronDownOutline from 'flowbite-svelte-icons/ChevronDownOutline.svelte';
	import ChevronUpOutline from 'flowbite-svelte-icons/ChevronUpOutline.svelte';
	import DownloadOutline from 'flowbite-svelte-icons/DownloadOutline.svelte';
	import FolderOpenOutline from 'flowbite-svelte-icons/FolderOpenOutline.svelte';
	import MailBoxOutline from 'flowbite-svelte-icons/MailBoxOutline.svelte';
	import MapPinAltOutline from 'flowbite-svelte-icons/MapPinAltOutline.svelte';
	import UserCircleOutline from 'flowbite-svelte-icons/UserCircleOutline.svelte';
	import { installPrompt } from '../../hooks.client';
	import { gradebookState } from './grades/gradebook.svelte';
	import { loadStudentInfo, studentInfoState } from './studentinfo/studentInfo.svelte';

	function logOut() {
		localStorage.clear();
		location.assign('/login');
	}

	loadStudentInfo();
</script>

<Sidebar activeUrl={page.url.pathname} class="h-screen">
	<SidebarWrapper class="flex h-screen flex-col justify-between gap-2">
		<SidebarGroup>
			<SidebarBrand
				site={{
					name: 'GradeVue',
					href: '/grades',
					img: '/favicon.svg'
				}}
			/>

			{#if page.url.pathname.startsWith('/grades')}
				<li class="rounded-lg bg-gray-900">
					<a
						href="/grades"
						class="flex items-center rounded-lg bg-gray-200 p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-700"
					>
						<AddressBookOutline class="focus:outline-none" />
						<span class="ms-3">Grades</span>
						{#if page.params.index}
							<ChevronUpOutline />
						{:else}
							<ChevronDownOutline />
						{/if}
					</a>
					{#if page.params.index && gradebookState.gradebook}
						<ul>
							{#each gradebookState.gradebook.Courses.Course as { _Title: title }, index}
								<li>
									<a
										href={`/grades/${index.toString()}`}
										class="text-gray-90 group flex w-full items-center rounded-lg p-2 text-base font-normal transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
									>
										<MapPinAltOutline
											class={page.params.index !== index.toString()
												? 'opacity-0 transition'
												: 'transition'}
										/>
										<span class="ml-3">
											{removeClassID(title)}
										</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{:else}
				<SidebarItem label="Grades" href="/grades">
					<svelte:fragment slot="icon">
						<AddressBookOutline class="focus:outline-none" />
					</svelte:fragment>
				</SidebarItem>
			{/if}

			<SidebarItem label="Attendance" href="/attendance">
				<svelte:fragment slot="icon">
					<BellOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem label="Documents" href="/documents">
				<svelte:fragment slot="icon">
					<FolderOpenOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem label="Mail" href="/mail">
				<svelte:fragment slot="icon">
					<MailBoxOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>

		<SidebarGroup>
			{#if $installPrompt.prompt}
				<SidebarItem label="Install Web App" onclick={() => $installPrompt.prompt?.()}>
					<svelte:fragment slot="icon">
						<DownloadOutline class="focus:outline-none" />
					</svelte:fragment>
					<svelte:fragment slot="subtext">
						<Badge rounded color="green" class="ml-auto">new</Badge>
					</svelte:fragment>
				</SidebarItem>
			{/if}

			<SidebarItem label="Feedback" href="/feedback">
				<svelte:fragment slot="icon">
					<AnnotationOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem label={studentInfoState.data?.FormattedName ?? ''} href="/studentinfo">
				<svelte:fragment slot="icon">
					<UserCircleOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem onclick={logOut} label="Log Out" href="/login">
				<svelte:fragment slot="icon">
					<ArrowRightToBracketOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
