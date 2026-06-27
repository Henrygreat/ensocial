<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	type Size = 'default' | 'sm' | 'lg' | 'icon';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		loading?: boolean;
		class?: string;
	}

	const {
		variant = 'default',
		size = 'default',
		loading = false,
		class: className,
		children,
		disabled,
		...restProps
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
		outline:
			'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	const sizeClasses: Record<Size, string> = {
		default: 'h-9 px-4 py-2 text-sm',
		sm: 'h-8 rounded-md px-3 text-xs',
		lg: 'h-11 rounded-md px-8 text-base',
		icon: 'h-9 w-9'
	};
</script>

<button
	class={cn(
		'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		'disabled:pointer-events-none disabled:opacity-50',
		'[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
	disabled={disabled || loading}
	{...restProps}
>
	{#if loading}
		<svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
			/>
		</svg>
	{/if}
	{@render children?.()}
</button>
