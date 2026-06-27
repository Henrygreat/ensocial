<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLTextareaAttributes {
		class?: string;
		error?: string;
	}

	const { class: className, error, ...restProps }: Props = $props();
</script>

<textarea
	class={cn(
		'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
		'placeholder:text-muted-foreground',
		'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'resize-none',
		error && 'border-destructive focus-visible:ring-destructive',
		className
	)}
	{...restProps}
></textarea>
{#if error}
	<p class="mt-1 text-xs text-destructive">{error}</p>
{/if}
