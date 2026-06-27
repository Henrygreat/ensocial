<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type Variant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: Variant;
		class?: string;
	}

	const { variant = 'default', class: className, children, ...restProps }: Props = $props();

	const variantClasses: Record<Variant, string> = {
		default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
		secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
		destructive:
			'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
		outline: 'text-foreground border-border',
		success: 'border-transparent bg-success/15 text-success',
		warning: 'border-transparent bg-warning/15 text-warning'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
		variantClasses[variant],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
