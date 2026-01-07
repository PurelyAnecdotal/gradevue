<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	export type Props = WithElementRef<Omit<HTMLInputAttributes, 'type'> & { type?: 'number' }>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type = 'number',
		class: className,
		'data-slot': dataSlot = 'input',
		...restProps
	}: Props = $props();

	const getValue = () => value ?? null;

	function setValue(newValue: number | null) {
		value = newValue ?? undefined;
	}
</script>

<input
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		'border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
		'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
		'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
		className
	)}
	{type}
	bind:value={getValue, setValue}
	{...restProps}
/>
