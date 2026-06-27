<script lang="ts">
	import { page } from '$app/stores';
	import { ui } from '$stores/ui.svelte';
	import Avatar from '$components/ui/avatar.svelte';
	import Button from '$components/ui/button.svelte';
	import { Menu, Search, Bell, Plus, Sun, Moon, Command } from 'lucide-svelte';
	import { toggleMode } from 'mode-watcher';
	import { cn } from '$lib/utils';

	const pageTitles: Record<string, string> = {
		'/dashboard': 'Dashboard',
		'/content': 'Content',
		'/content/compose': 'Compose',
		'/calendar': 'Calendar',
		'/publish': 'Publishing',
		'/inbox': 'Inbox',
		'/analytics': 'Analytics',
		'/ai': 'AI Studio',
		'/connections': 'Connections',
		'/team': 'Team',
		'/settings': 'Settings'
	};

	const title = $derived(
		pageTitles[$page.url.pathname] ??
			$page.url.pathname
				.split('/')
				.pop()
				?.replace(/-/g, ' ')
				.replace(/\b\w/g, (c) => c.toUpperCase()) ??
			'EnSocial'
	);
</script>

<header
	class={cn(
		'fixed top-0 right-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 transition-all duration-200',
		ui.sidebarOpen ? 'left-60' : 'left-0'
	)}
>
	<!-- Sidebar toggle -->
	<button
		onclick={() => ui.toggleSidebar()}
		class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
		aria-label="Toggle sidebar"
	>
		<Menu class="size-4" />
	</button>

	<!-- Page title -->
	<h1 class="text-sm font-semibold text-foreground hidden sm:block">{title}</h1>

	<div class="flex-1" />

	<!-- Search -->
	<button
		onclick={() => ui.openCommand()}
		class="hidden md:flex items-center gap-2 h-8 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent transition-colors w-52"
	>
		<Search class="size-3.5 shrink-0" />
		<span class="flex-1 text-left">Search...</span>
		<kbd
			class="inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
		>
			<Command class="size-2.5" />K
		</kbd>
	</button>

	<!-- Compose -->
	<Button href="/content/compose" size="sm" class="hidden sm:inline-flex">
		<Plus class="size-4" />
		New Post
	</Button>

	<!-- Theme toggle -->
	<button
		onclick={toggleMode}
		class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
		aria-label="Toggle theme"
	>
		<Sun class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
		<Moon
			class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
	</button>

	<!-- Notifications -->
	<button
		class="relative flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
		aria-label="Notifications"
	>
		<Bell class="size-4" />
		<span
			class="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
		/>
	</button>

	<!-- User -->
	<button class="rounded-full">
		<Avatar name="Henry Great" size="sm" />
	</button>
</header>
