<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
	}

	const { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}
	{...restProps}
>
	{@render children?.()}
</div>
