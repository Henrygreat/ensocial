<script lang="ts">
	import Sidebar from '$components/layout/sidebar.svelte';
	import Header from '$components/layout/header.svelte';
	import { ui } from '$stores/ui.svelte';
	import { cn } from '$lib/utils';

	const { children } = $props();
</script>

<Sidebar />
<Header />

<main
	class={cn(
		'min-h-screen pt-14 transition-all duration-200',
		ui.sidebarOpen ? 'lg:pl-60' : 'lg:pl-0'
	)}
>
	<div class="p-6">
		{@render children()}
	</div>
</main>
