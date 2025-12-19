<script lang="ts">
	import { brand, LocalStorageKey } from '$lib';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
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

<div class="flex flex-col justify-center gap-4 px-4">
	{#if studentInfoState.data}
		<Card class="flex max-w-none flex-row gap-4 dark:text-white">
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

	<Accordion>
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
</div>

{#snippet toolButton(name: string, func: () => void)}
	<TableBodyCell>
		<Button color="alternative" onclick={func}>{name}</Button>
	</TableBodyCell>
{/snippet}
