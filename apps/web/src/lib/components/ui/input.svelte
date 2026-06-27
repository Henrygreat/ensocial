<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLInputAttributes {
		class?: string;
		error?: string;
	}

	const { class: className, error, ...restProps }: Props = $props();
</script>

<input
	class={cn(
		'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm',
		'placeholder:text-muted-foreground',
		'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
		'disabled:cursor-not-allowed disabled:opacity-50',
		error && 'border-destructive focus-visible:ring-destructive',
		className
	)}
	{...restProps}
/>
{#if error}
	<p class="mt-1 text-xs text-destructive">{error}</p>
{/if}
