<script lang="ts">
	import { cn, initials } from '$lib/utils';

	interface Props {
		src?: string | null;
		name?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	const { src, name = '', size = 'md', class: className }: Props = $props();

	const sizeClasses = {
		xs: 'size-6 text-xs',
		sm: 'size-8 text-xs',
		md: 'size-9 text-sm',
		lg: 'size-11 text-base',
		xl: 'size-14 text-lg'
	};

	const fallback = $derived(initials(name || '?'));
</script>

<div
	class={cn(
		'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-medium text-primary select-none',
		sizeClasses[size],
		className
	)}
>
	{#if src}
		<img {src} alt={name} class="h-full w-full object-cover" />
	{:else}
		{fallback}
	{/if}
</div>
