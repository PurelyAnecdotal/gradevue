<!-- Vendored from https://github.com/themesberg/flowbite-svelte/blob/2257cbcda7ed6149ada56d6be024b6d6e9410d1c/src/lib/forms/NumberInput.svelte -->

<script lang="ts">
	import Input from 'flowbite-svelte/Input.svelte';
	import type { ComponentProps } from 'svelte';

	interface Props extends ComponentProps<Input> {
		value?: number;
	}

	let {
		value = $bindable(),
		onblur,
		onchange,
		onclick,
		oncontextmenu,
		onfocus,
		onkeydown,
		onkeypress,
		onkeyup,
		onmouseover,
		onmouseenter,
		onmouseleave,
		onpaste,
		oninput,
		...restProps
	}: Props = $props();

	// Svelte numeric bindings can become null when the input is emptied by the user. The documentation doesn't match this behavior.
	// Because value can only be a number or undefined, we need to wrap the bound value to convert nulls to undefined.
	let nullableValue: number | null = $state(value ?? null);
</script>

<Input let:props {...restProps}>
	<input
		{...props}
		type="number"
		bind:value={nullableValue}
		{onblur}
		{onchange}
		{onclick}
		{oncontextmenu}
		{onfocus}
		{onkeydown}
		{onkeypress}
		{onkeyup}
		{onmouseover}
		{onmouseenter}
		{onmouseleave}
		{onpaste}
		oninput={(e) => {
			// This hack is neccessary to make sure that value is updated before the event fires. $effect isn't fast enough.
			value = nullableValue ?? undefined;
			oninput?.(e);
		}}
	/>
</Input>
