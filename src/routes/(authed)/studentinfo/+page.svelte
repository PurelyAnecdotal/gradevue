<script lang="ts">
	import { browser } from '$app/environment';
	import { loadStudentInfo } from '$lib/cache';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { studentInfo, studentInfoLoaded } from '$lib/stores';
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

	if (!$studentInfo && browser) loadStudentInfo();

	const dataSources = ['gradebook', 'attendance', 'studentInfo', 'documentsList', 'mail'];

	function copy(key: string) {
		const data = localStorage.getItem(key);

		if (!data) {
			alert('Not found');
			return;
		}

		navigator.clipboard.writeText(data);
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

	function remove(key: string) {
		localStorage.removeItem(key);
	}
</script>

<svelte:head>
	<title>Student Info - GradeVue</title>
</svelte:head>

<LoadingBanner show={!$studentInfoLoaded} loadingMsg="Loading student info..." />

<div class="flex flex-col justify-center gap-4 p-4">
	{#if $studentInfo}
		<Card class="flex max-w-none flex-row gap-4 dark:text-white">
			<img
				class="h-xl rounded"
				src="data:image/png;base64,{$studentInfo.Photo}"
				alt="Student Portrait"
			/>
			<div class="flex w-full flex-col">
				<h1 class="w-full text-2xl">
					{$studentInfo.FormattedName}
				</h1>
				<span class="text-xl">
					{$studentInfo.PermID}
				</span>
				<span>Grade {$studentInfo.Grade}</span>
				<span>{$studentInfo.Gender}</span>
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
					{#each dataSources as dataSource}
						<TableBodyRow>
							<TableBodyCell>{dataSource}</TableBodyCell>

							<TableBodyCell>
								<Button color="alternative" onclick={() => copy(dataSource)}>Copy</Button>
							</TableBodyCell>

							<TableBodyCell>
								<Button color="alternative" onclick={() => paste(dataSource)}>Paste</Button>
							</TableBodyCell>

							<TableBodyCell>
								<Button color="alternative" onclick={() => remove(dataSource)}>Delete</Button>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</AccordionItem>
	</Accordion>
</div>
