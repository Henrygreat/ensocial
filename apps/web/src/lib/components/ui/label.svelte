<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLLabelAttributes {
		class?: string;
	}

	const { class: className, children, ...restProps }: Props = $props();
</script>

<label
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</label>
