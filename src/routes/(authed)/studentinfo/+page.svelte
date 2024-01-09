<script lang="ts">
	import { studentInfo } from '$lib/stores';
	import { Card } from 'flowbite-svelte';
</script>

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
