<script lang="ts">
	import { page } from '$app/state';
	import { brand, removeClassID } from '$lib';
	import {
		Sidebar,
		SidebarBrand,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		Spinner
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
	import type { Component, Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { installPrompt } from '../../hooks.client';
	import { getCurrentGradebookState, gradebooksState } from './grades/gradebook.svelte';
	import { loadStudentInfo, studentInfoState } from './studentinfo/studentInfo.svelte';

	function logOut() {
		localStorage.clear();
		location.assign('/login');
	}

	const currentGradebookState = $derived(getCurrentGradebookState(gradebooksState));

	loadStudentInfo();
</script>

{#snippet sidebarLink(
	label: string,
	href: string,
	Icon: Component,
	onclick?: () => void,
	subtext?: Snippet
)}
	<SidebarItem {label} {href} {onclick}>
		<svelte:fragment slot="icon">
			<Icon />
		</svelte:fragment>
		<svelte:fragment slot="subtext">
			{#if subtext}
				{@render subtext()}
			{/if}
		</svelte:fragment>
	</SidebarItem>
{/snippet}

<Sidebar activeUrl={page.url.pathname} class="h-screen">
	<SidebarWrapper class="flex h-screen flex-col justify-between gap-2">
		<SidebarGroup>
			<SidebarBrand site={{ name: brand, href: '/grades', img: '/favicon.svg' }} />

			{#if page.url.pathname.startsWith('/grades')}
				<li class="rounded-lg bg-gray-900">
					<a
						href="/grades"
						class="flex items-center rounded-lg bg-gray-200 p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-700"
					>
						<AddressBookOutline />
						<span class="ms-3">Grades</span>
						{#if page.params.index}
							<ChevronUpOutline />
						{:else}
							<ChevronDownOutline />
						{/if}
					</a>
					<svelte:boundary>
						{#if page.params.index !== undefined && currentGradebookState?.data}
							<ul>
								{#each currentGradebookState.data.Courses.Course as { _Title: title, _CourseID }, index (_CourseID)}
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

						{#snippet pending()}
							{#if page.params.index !== undefined}
								<div class="flex w-full items-center justify-center p-4">
									<Spinner />
								</div>
							{/if}
						{/snippet}
					</svelte:boundary>
				</li>
			{:else}
				{@render sidebarLink('Grades', '/grades', AddressBookOutline)}
			{/if}

			{@render sidebarLink('Attendance', '/attendance', BellOutline)}

			{@render sidebarLink('Documents', '/documents', FolderOpenOutline)}

			{@render sidebarLink('Mail', '/mail', MailBoxOutline)}
		</SidebarGroup>

		<SidebarGroup>
			{#if $installPrompt.prompt}
				<div transition:fade>
					{@render sidebarLink(
						'Install Web App',
						'#',
						DownloadOutline,
						() => void $installPrompt.prompt?.()
					)}
				</div>
			{/if}

			{@render sidebarLink('Feedback', '/feedback', AnnotationOutline)}

			<SidebarItem
				label={studentInfoState.data?.FormattedName ?? '.'}
				spanClass="ms-3 {studentInfoState.data ? '' : 'opacity-0'}"
				href="/studentinfo"
			>
				<svelte:fragment slot="icon">
					<UserCircleOutline />
				</svelte:fragment>
			</SidebarItem>

			{@render sidebarLink('Log Out', '/login', ArrowRightToBracketOutline, logOut)}
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
