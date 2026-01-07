<script lang="ts">
	import { removeCourseType } from '$lib';
	import { brand } from '$lib/brand';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Spinner } from '$lib/components/ui/spinner';
	import AppWindowMacIcon from '@lucide/svelte/icons/app-window-mac';
	import BellIcon from '@lucide/svelte/icons/bell';
	import CircleUserIcon from '@lucide/svelte/icons/circle-user';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MessageSquareWarningIcon from '@lucide/svelte/icons/message-square-warning';
	import NotebookTextIcon from '@lucide/svelte/icons/notebook-text';
	import type { Component } from 'svelte';
	import { fade } from 'svelte/transition';
	import { installPrompt } from '../../hooks.client';
	import {
		getCurrentGradebookState,
		gradebooksState,
		loadGradebooks
	} from './grades/gradebook.svelte';
	import { loadStudentInfo, studentInfoState } from './studentinfo/studentInfo.svelte';

	function logOut() {
		localStorage.clear();
		location.assign('/login');
	}

	const currentGradebookState = $derived(getCurrentGradebookState(gradebooksState));

	function installWebApp() {
		$installPrompt.prompt?.();
	}

	loadStudentInfo();

	const data = {
		header: [
			{
				title: 'Attendance',
				url: '/attendance',
				icon: BellIcon
			},
			{
				title: 'Documents',
				url: '/documents',
				icon: FolderOpenIcon
			},
			{
				title: 'Mail',
				url: '/mail',
				icon: InboxIcon
			}
		],
		footer: [
			{
				title: 'Feedback',
				url: '/feedback',
				icon: MessageSquareWarningIcon
			},
			{
				title: studentInfoState.data?.FormattedName ?? 'Student Info',
				url: '/studentinfo',
				icon: CircleUserIcon
			},
			{
				title: 'Log Out',
				onclick: logOut,
				icon: LogOutIcon
			}
		],
		grades: {
			title: 'Grades',
			url: '/grades',
			icon: NotebookTextIcon
		},
		pwa: {
			title: 'Install Web App',
			icon: AppWindowMacIcon,
			onclick: installWebApp
		}
	};

	loadGradebooks();
</script>

{#snippet menuItem({
	title,
	url,
	onclick,
	icon: Icon
}: {
	title: string;
	url?: string;
	onclick?: () => void;
	icon: Component;
})}
	<Sidebar.MenuItem>
		<Sidebar.MenuButton class="h-10 text-base">
			{#snippet child({ props })}
				{#if url}
					<a href={url} {...props}>
						<Icon /> <span>{title}</span>
					</a>
				{:else}
					<button {onclick} {...props}>
						<Icon /> <span>{title}</span>
					</button>
				{/if}
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
{/snippet}

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<div class="m-2 flex flex-row items-center">
					<img src="/favicon.svg" class="size-6" alt={brand} />
					<span class="ml-2 text-lg font-bold tracking-tight">{brand}</span>
				</div>
			</Sidebar.MenuItem>

			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="h-10 text-base">
					{#snippet child({ props })}
						<a href={data.grades.url} {...props}>
							<data.grades.icon /> <span>{data.grades.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>

				<svelte:boundary>
					{#if currentGradebookState?.data}
						<Sidebar.MenuSub>
							{#each currentGradebookState.data.Courses.Course as Course, index (Course._CourseID)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton class="h-8 truncate text-base">
										{#snippet child({ props })}
											<a href={`${data.grades.url}/${index.toString()}`} {...props}>
												{removeCourseType(Course._CourseName)}
											</a>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}

					{#snippet pending()}
						<Sidebar.MenuSub>
							<div class="flex w-full items-center justify-center p-4">
								<Spinner />
							</div>
						</Sidebar.MenuSub>
					{/snippet}
				</svelte:boundary>
			</Sidebar.MenuItem>

			{#each data.header as item (item.title)}
				{@render menuItem(item)}
			{/each}
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content />

	<Sidebar.Footer>
		<Sidebar.Menu class="gap-2">
			{#if $installPrompt.prompt}
				<div transition:fade>
					{@render menuItem(data.pwa)}
				</div>
			{/if}

			{#each data.footer as item (item.title)}
				{@render menuItem(item)}
			{/each}
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
