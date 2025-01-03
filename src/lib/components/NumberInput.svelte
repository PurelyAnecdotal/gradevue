<!-- Vendored from https://github.com/themesberg/flowbite-svelte/blob/2257cbcda7ed6149ada56d6be024b6d6e9410d1c/src/lib/forms/NumberInput.svelte -->

<script lang="ts">
	import Input from 'flowbite-svelte/Input.svelte';
	import type { ComponentProps } from 'svelte';

	interface $$Props extends ComponentProps<Input> {
		value?: number;
	}

	export let value: $$Props['value'] = undefined;
</script>

<Input let:props {...$$restProps}>
	<input
		{...props}
		type="number"
		bind:value
		on:blur
		on:change
		on:click
		on:contextmenu
		on:focus
		on:keydown
		on:keypress
		on:keyup
		on:mouseover
		on:mouseenter
		on:mouseleave
		on:paste
		on:input
	/>
</Input>
