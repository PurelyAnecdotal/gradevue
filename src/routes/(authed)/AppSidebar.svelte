<script lang="ts">
	import { page } from '$app/state';
	import { removeClassID } from '$lib';
	import { brand } from '$lib/brand';
	import AppWindowMacIcon from '@lucide/svelte/icons/app-window-mac';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import CircleUserIcon from '@lucide/svelte/icons/circle-user';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import MessageSquareWarningIcon from '@lucide/svelte/icons/message-square-warning';
	import NotebookTextIcon from '@lucide/svelte/icons/notebook-text';
	import {
		Sidebar,
		SidebarBrand,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		Spinner
	} from 'flowbite-svelte';
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
			<Icon class="h-5 w-5" />
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
			<SidebarBrand
				site={{ name: brand, href: '/grades', img: '/favicon.svg' }}
				class="tracking-tight"
			/>

			{#if page.url.pathname.startsWith('/grades')}
				<li class="rounded-lg dark:bg-gray-900">
					<a
						href="/grades"
						class="flex items-center rounded-lg p-2 text-base font-normal hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-700"
					>
						<NotebookTextIcon class="mr-3 h-5 w-5" />
						<span class="mr-1">Grades</span>
						{#if page.params.index}
							<ChevronUpIcon class="h-4 w-4" />
						{:else}
							<ChevronDownIcon class="h-4 w-4" />
						{/if}
					</a>
					<svelte:boundary>
						{#if page.params.index !== undefined && currentGradebookState?.data}
							<ul>
								{#each currentGradebookState.data.Courses.Course as { _Title: title, _CourseID }, index (_CourseID)}
									<li>
										<a
											href={`/grades/${index.toString()}`}
											class="text-gray-90 group flex w-full items-center gap-3 rounded-lg p-2 text-base font-normal transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
										>
											<MapPinIcon
												class="{page.params.index !== index.toString()
													? 'opacity-0 transition'
													: 'transition'} h-5 w-5"
											/>
											{removeClassID(title)}
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
				{@render sidebarLink('Grades', '/grades', NotebookTextIcon)}
			{/if}

			{@render sidebarLink('Attendance', '/attendance', BellIcon)}

			{@render sidebarLink('Documents', '/documents', FolderOpenIcon)}

			{@render sidebarLink('Mail', '/mail', InboxIcon)}
		</SidebarGroup>

		<SidebarGroup>
			{#if $installPrompt.prompt}
				<div transition:fade>
					{@render sidebarLink(
						'Install Web App',
						'#',
						AppWindowMacIcon,
						() => void $installPrompt.prompt?.()
					)}
				</div>
			{/if}

			{@render sidebarLink('Feedback', '/feedback', MessageSquareWarningIcon)}

			<SidebarItem
				label={studentInfoState.data?.FormattedName ?? '.'}
				spanClass="ms-3 {studentInfoState.data ? '' : 'opacity-0'}"
				href="/studentinfo"
			>
				<svelte:fragment slot="icon">
					<CircleUserIcon class="h-5 w-5" />
				</svelte:fragment>
			</SidebarItem>

			{@render sidebarLink('Log Out', '/login', LogOutIcon, logOut)}
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
