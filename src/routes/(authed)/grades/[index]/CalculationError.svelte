<script lang="ts">
	import { brand } from '$lib/brand';
	import * as Alert from '$lib/components/ui/alert';
	import AlertCircleIcon from '@lucide/svelte/icons/circle-alert';

	interface Props {
		hypotheticalMode?: boolean;
	}
	let { hypotheticalMode = false }: Props = $props();
</script>

<Alert.Root variant="destructive" class="max-w-3xl">
	<AlertCircleIcon />

	<Alert.Title>
		{#if hypotheticalMode}
			Grade calculations in Hypothetical Mode are inaccurate
		{:else}
			Grade calculation error
		{/if}
	</Alert.Title>

	<Alert.Description>
		<p>
			{brand}'s calculations don't match your official grade percentage. This could mean that there
			are hidden assignments that {brand} can't see, or that {brand} isn't calculating your grade correctly.
			Your overall grade is still correct, but {brand}'s calculations and charts might be off.
		</p>

		<p>If this happens continuously, please contact us.</p>
	</Alert.Description>
</Alert.Root>
