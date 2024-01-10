<script lang="ts">
	import { browser } from '$app/environment';
	import LoadingBanner from '$lib/LoadingBanner.svelte';
	import { loadStudentInfo } from '$lib/cache';
	import { studentInfo, studentInfoLoaded } from '$lib/stores';
	import { Card } from 'flowbite-svelte';

	if (!$studentInfo && browser) loadStudentInfo();
</script>

<LoadingBanner show={!$studentInfoLoaded} loadingMsg="Loading student info..." />

{#if $studentInfo}
	<div class="p-4 flex justify-center">
		<Card class="max-w-none flex flex-row gap-4 dark:text-white">
			<img
				class="rounded h-xl"
				src="data:image/png;base64,{$studentInfo.Photo}"
				alt="Student Portrait"
			/>
			<div class="w-full flex flex-col">
				<h1 class="text-2xl w-full">
					{$studentInfo.FormattedName}
				</h1>
				<span class="text-xl">
					{$studentInfo.PermID}
				</span>
				<span>Grade {$studentInfo.Grade}</span>
				<span>{$studentInfo.Gender}</span>
			</div>
		</Card>
	</div>
{/if}
