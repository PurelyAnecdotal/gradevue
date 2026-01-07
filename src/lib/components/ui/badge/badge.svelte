<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
				secondary:
					'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
				destructive:
					'bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
			},
			color: {
				default: '',
				red: '',
				orange: '',
				amber: '',
				yellow: '',
				lime: '',
				green: '',
				emerald: '',
				teal: '',
				cyan: '',
				sky: '',
				blue: '',
				indigo: '',
				violet: '',
				purple: '',
				fuchsia: '',
				pink: '',
				rose: ''
			},
			outline: {
				true: '',
				false: ''
			}
		},
		compoundVariants: [
			{ color: 'red', outline: false, class: 'bg-red-200 dark:bg-red-900/70 text-secondary-foreground border-transparent' },
			{ color: 'orange', outline: false, class: 'bg-orange-200 dark:bg-orange-900/70 text-secondary-foreground border-transparent' },
			{ color: 'amber', outline: false, class: 'bg-amber-200 dark:bg-amber-900/70 text-secondary-foreground border-transparent' },
			{ color: 'yellow', outline: false, class: 'bg-yellow-200 dark:bg-yellow-900/70 text-secondary-foreground border-transparent' },
			{ color: 'lime', outline: false, class: 'bg-lime-200 dark:bg-lime-900/70 text-secondary-foreground border-transparent' },
			{ color: 'green', outline: false, class: 'bg-green-200 dark:bg-green-900/70 text-secondary-foreground border-transparent' },
			{ color: 'emerald', outline: false, class: 'bg-emerald-200 dark:bg-emerald-900/70 text-secondary-foreground border-transparent' },
			{ color: 'teal', outline: false, class: 'bg-teal-200 dark:bg-teal-900/70 text-secondary-foreground border-transparent' },
			{ color: 'cyan', outline: false, class: 'bg-cyan-200 dark:bg-cyan-900/70 text-secondary-foreground border-transparent' },
			{ color: 'sky', outline: false, class: 'bg-sky-200 dark:bg-sky-900/70 text-secondary-foreground border-transparent' },
			{ color: 'blue', outline: false, class: 'bg-blue-200 dark:bg-blue-900/70 text-secondary-foreground border-transparent' },
			{ color: 'indigo', outline: false, class: 'bg-indigo-200 dark:bg-indigo-900/70 text-secondary-foreground border-transparent' },
			{ color: 'violet', outline: false, class: 'bg-violet-200 dark:bg-violet-900/70 text-secondary-foreground border-transparent' },
			{ color: 'purple', outline: false, class: 'bg-purple-200 dark:bg-purple-900/70 text-secondary-foreground border-transparent' },
			{ color: 'fuchsia', outline: false, class: 'bg-fuchsia-200 dark:bg-fuchsia-900/70 text-secondary-foreground border-transparent' },
			{ color: 'pink', outline: false, class: 'bg-pink-200 dark:bg-pink-900/70 text-secondary-foreground border-transparent' },
			{ color: 'rose', outline: false, class: 'bg-rose-200 dark:bg-rose-900/70 text-secondary-foreground border-transparent' },
			{ color: 'red', outline: true, class: 'border-red-400 dark:border-red-700 bg-red-100 dark:bg-red-800/20 text-secondary-foreground' },
			{ color: 'orange', outline: true, class: 'border-orange-400 dark:border-orange-700 bg-orange-100 dark:bg-orange-800/20 text-secondary-foreground' },
			{ color: 'amber', outline: true, class: 'border-amber-400 dark:border-amber-700 bg-amber-100 dark:bg-amber-800/20 text-secondary-foreground' },
			{ color: 'yellow', outline: true, class: 'border-yellow-400 dark:border-yellow-700 bg-yellow-100 dark:bg-yellow-800/20 text-secondary-foreground' },
			{ color: 'lime', outline: true, class: 'border-lime-400 dark:border-lime-700 bg-lime-100 dark:bg-lime-800/20 text-secondary-foreground' },
			{ color: 'green', outline: true, class: 'border-green-400 dark:border-green-700 bg-green-100 dark:bg-green-800/20 text-secondary-foreground' },
			{ color: 'emerald', outline: true, class: 'border-emerald-400 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-800/20 text-secondary-foreground' },
			{ color: 'teal', outline: true, class: 'border-teal-400 dark:border-teal-700 bg-teal-100 dark:bg-teal-800/20 text-secondary-foreground' },
			{ color: 'cyan', outline: true, class: 'border-cyan-400 dark:border-cyan-700 bg-cyan-100 dark:bg-cyan-800/20 text-secondary-foreground' },
			{ color: 'sky', outline: true, class: 'border-sky-400 dark:border-sky-700 bg-sky-100 dark:bg-sky-800/20 text-secondary-foreground' },
			{ color: 'blue', outline: true, class: 'border-blue-400 dark:border-blue-700 bg-blue-100 dark:bg-blue-800/20 text-secondary-foreground' },
			{ color: 'indigo', outline: true, class: 'border-indigo-400 dark:border-indigo-700 bg-indigo-100 dark:bg-indigo-800/20 text-secondary-foreground' },
			{ color: 'violet', outline: true, class: 'border-violet-400 dark:border-violet-700 bg-violet-100 dark:bg-violet-800/20 text-secondary-foreground' },
			{ color: 'purple', outline: true, class: 'border-purple-400 dark:border-purple-700 bg-purple-100 dark:bg-purple-800/20 text-secondary-foreground' },
			{ color: 'fuchsia', outline: true, class: 'border-fuchsia-400 dark:border-fuchsia-700 bg-fuchsia-100 dark:bg-fuchsia-800/20 text-secondary-foreground' },
			{ color: 'pink', outline: true, class: 'border-pink-400 dark:border-pink-700 bg-pink-100 dark:bg-pink-800/20 text-secondary-foreground' },
			{ color: 'rose', outline: true, class: 'border-rose-400 dark:border-rose-700 bg-rose-100 dark:bg-rose-800/20 text-secondary-foreground' }
		],
		defaultVariants: {
			variant: 'default',
			color: 'default',
			outline: false
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
	export type BadgeColor = VariantProps<typeof badgeVariants>['color'];
	export type BadgeOutline = VariantProps<typeof badgeVariants>['outline'];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		color = 'default',
		outline = false,
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
		color?: BadgeColor;
		outline?: BadgeOutline;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant, color, outline }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
