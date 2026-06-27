<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	}

	const { orientation = 'horizontal', class: className }: Props = $props();
</script>

<div
	role="separator"
	class={cn(
		'shrink-0 bg-border',
		orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
		className
	)}
/>
