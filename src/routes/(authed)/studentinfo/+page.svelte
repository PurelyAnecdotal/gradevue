<script lang="ts">
	import { LocalStorageKey } from '$lib';
	import { acc } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import FolderLockIcon from '@lucide/svelte/icons/folder-lock';
	import {
		Accordion,
		AccordionItem,
		Button,
		Card,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow
	} from 'flowbite-svelte';
	import { loadStudentInfo, studentInfoState } from './studentInfo.svelte';

	loadStudentInfo();

	const dataSources = Object.values(LocalStorageKey);

	async function copy(key: string) {
		const data = localStorage.getItem(key);
		if (data === null) {
			alert('Not found');
			return;
		}

		await navigator.clipboard.writeText(data);
	}

	async function paste(key: string) {
		const text = await navigator.clipboard.readText();

		try {
			JSON.parse(text);
		} catch {
			alert('Invalid JSON');
			return;
		}

		localStorage.setItem(key, text);
	}

	const remove = (key: string) => localStorage.removeItem(key);

	let showPassword = $state(false);
	function togglePassword() {
		showPassword = !showPassword;
	}

	function copyUsername() {
		if (!acc.studentAccount) return;
		navigator.clipboard.writeText(acc.studentAccount.userID);
	}
	function copyPassword() {
		if (!acc.studentAccount) return;
		navigator.clipboard.writeText(acc.studentAccount.password);
	}
	function copyDomain() {
		if (!acc.studentAccount) return;
		navigator.clipboard.writeText(acc.studentAccount.domain);
	}
</script>

<svelte:head>
	<title>Student Info - {brand}</title>
</svelte:head>

<LoadingBanner show={!studentInfoState.loaded} loadingMsg="Loading student info..." />

{#if studentInfoState.lastRefresh !== undefined}
	<RefreshIndicator
		loaded={studentInfoState.loaded}
		lastRefresh={studentInfoState.lastRefresh}
		refresh={() => loadStudentInfo(true)}
	/>
{/if}

<div class="m-4 flex flex-wrap gap-4">
	{#if studentInfoState.data}
		<Card class="mx-auto flex max-w-lg grow flex-row gap-4 dark:text-white">
			<img
				class="h-xl rounded-sm"
				src="data:image/png;base64,{studentInfoState.data.Photo}"
				alt="Student Portrait"
			/>
			<div class="flex w-full flex-col">
				<h1 class="w-full text-2xl">
					{studentInfoState.data.FormattedName}
				</h1>
				<span class="text-xl">
					{studentInfoState.data.PermID}
				</span>
				<span>Grade {studentInfoState.data.Grade}</span>
				<span>{studentInfoState.data.Gender}</span>
			</div>
		</Card>
	{/if}

	{#if acc.studentAccount}
		<Card class="mx-auto max-w-lg grow space-y-2 dark:text-gray-300">
			<div class="flex items-center justify-between">
				<h2 class="text-xl text-white">Login Information</h2>
				<p class="flex items-center gap-2">
					<FolderLockIcon class="h-4 w-4" />Stored on-device
				</p>
			</div>

			<dl>
				<dt class="">Username</dt>
				<dd class="flex items-center justify-end gap-2 text-white">
					{acc.studentAccount.userID}
					<Button onclick={copyUsername} color="light" class="p-2" title="Copy username">
						<CopyIcon class="h-4 w-4" />
					</Button>
				</dd>
				<dt class="">Password</dt>
				<dd class="flex items-center justify-end gap-2 text-white">
					<span class="{showPassword ? '' : 'blur select-none'} transition-all">
						{#if showPassword}
							{acc.studentAccount.password}
						{:else}
							#Wa5$^yB%4R#6K^C
						{/if}
					</span>
					{#if !showPassword}
						<Button onclick={togglePassword} color="light" class="p-2" title="Show password">
							<EyeIcon class="h-4 w-4" />
						</Button>
					{/if}
					<Button onclick={copyPassword} color="light" class="p-2" title="Copy password">
						<CopyIcon class="h-4 w-4" />
					</Button>
				</dd>
				<dt>Domain</dt>
				<dd class="flex items-center justify-end gap-2 text-white">
					{acc.studentAccount.domain}
					<Button onclick={copyDomain} color="light" class="p-2" title="Copy domain">
						<CopyIcon class="h-4 w-4" />
					</Button>
				</dd>
			</dl>
		</Card>
	{/if}
</div>

<Accordion class="m-4">
	<AccordionItem paddingDefault="0">
		<span slot="header" class="p-5">Developer Tools</span>

		<svg
			slot="arrowdown"
			class="mr-5 h-3 w-3 text-gray-800 dark:text-white"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 10 6"
		>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m1 1 4 4 4-4"
			/>
		</svg>

		<svg
			slot="arrowup"
			class="mr-5 h-3 w-3 text-gray-800 dark:text-white"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 10 6"
		>
			hi
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 5 5 1 1 5"
			/>
		</svg>

		<Table>
			<TableBody>
				{#each dataSources as dataSource (dataSource)}
					<TableBodyRow>
						<TableBodyCell>{dataSource}</TableBodyCell>
						{@render toolButton('Copy', () => void copy(dataSource))}
						{@render toolButton('Paste', () => void paste(dataSource))}
						{@render toolButton('Delete', () => remove(dataSource))}
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</AccordionItem>
</Accordion>

{#snippet toolButton(name: string, func: () => void)}
	<TableBodyCell>
		<Button color="alternative" onclick={func}>{name}</Button>
	</TableBodyCell>
{/snippet}
