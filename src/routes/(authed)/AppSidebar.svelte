<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { removeClassID } from '$lib';
	import { loadStudentInfo } from '$lib/cache';
	import { gradebook, studentInfo } from '$lib/stores';
	import {
		Sidebar,
		SidebarBrand,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import {
		AddressBookOutline,
		AnnotationOutline,
		ArrowRightToBracketOutline,
		BellOutline,
		ChevronDownOutline,
		ChevronUpOutline,
		FolderOpenOutline,
		MailBoxOutline,
		MapPinAltOutline,
		UserCircleOutline
	} from 'flowbite-svelte-icons';

	function logOut() {
		localStorage.clear();
		location.assign('/login');
	}

	if (!$studentInfo && browser) loadStudentInfo();
</script>

<Sidebar activeUrl={page.url.pathname} class="h-screen">
	<SidebarWrapper class="h-screen flex flex-col justify-between gap-2">
		<SidebarGroup>
			<SidebarBrand
				site={{
					name: 'GradeVue',
					href: '/grades',
					img: '/favicon.svg'
				}}
			/>

			{#if page.url.pathname.startsWith('/grades')}
				<li class="bg-gray-900 rounded-lg">
					<a
						href="/grades"
						class="flex items-center p-2 text-base font-normal text-gray-900 bg-gray-200 dark:bg-gray-700 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<AddressBookOutline class="focus:outline-none" />
						<span class="ms-3">Grades</span>
						{#if page.params.index}
							<ChevronUpOutline />
						{:else}
							<ChevronDownOutline />
						{/if}
					</a>
					{#if page.params.index}
						<ul>
							{#each $gradebook?.Courses.Course ?? [] as { _Title: title }, index}
								<li>
									<a
										href={`/grades/${index.toString()}`}
										class="flex items-center p-2 w-full text-base font-normal text-gray-90 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
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
			<SidebarItem label="Feedback" href="/feedback">
				<svelte:fragment slot="icon">
					<AnnotationOutline class="focus:outline-none" />
				</svelte:fragment>
			</SidebarItem>

			<SidebarItem label={$studentInfo?.FormattedName ?? ''} href="/studentinfo">
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
