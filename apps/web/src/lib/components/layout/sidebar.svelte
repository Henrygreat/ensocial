<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { ui } from '$stores/ui.svelte';
	import Avatar from '$components/ui/avatar.svelte';
	import {
		LayoutDashboard,
		FileEdit,
		CalendarDays,
		Rocket,
		MessagesSquare,
		BarChart3,
		Sparkles,
		Users,
		Settings2,
		ChevronDown,
		Plus,
		Plug2,
		LogOut,
		type Icon
	} from 'lucide-svelte';
	import type { Component } from 'svelte';

	interface NavItem {
		href: string;
		icon: Component;
		label: string;
		badge?: string | number;
	}

	const mainNav: NavItem[] = [
		{ href: '/dashboard', icon: LayoutDashboard as Component, label: 'Dashboard' },
		{ href: '/content', icon: FileEdit as Component, label: 'Content' },
		{ href: '/calendar', icon: CalendarDays as Component, label: 'Calendar' },
		{ href: '/publish', icon: Rocket as Component, label: 'Publishing' },
		{ href: '/inbox', icon: MessagesSquare as Component, label: 'Inbox', badge: 3 },
		{ href: '/analytics', icon: BarChart3 as Component, label: 'Analytics' },
		{ href: '/ai', icon: Sparkles as Component, label: 'AI Studio' },
		{ href: '/connections', icon: Plug2 as Component, label: 'Connections' }
	];

	const bottomNav: NavItem[] = [
		{ href: '/team', icon: Users as Component, label: 'Team' },
		{ href: '/settings', icon: Settings2 as Component, label: 'Settings' }
	];

	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		if (href === '/dashboard') return path === '/dashboard';
		return path.startsWith(href);
	}
</script>

<!-- Desktop sidebar -->
<aside
	class={cn(
		'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200',
		!ui.sidebarOpen && '-translate-x-full lg:translate-x-0 lg:w-16'
	)}
>
	<!-- Logo -->
	<div class="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
		<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
			<svg viewBox="0 0 32 32" fill="none" class="size-5">
				<rect x="5" y="7" width="14" height="2.5" rx="1.25" fill="white" />
				<rect x="5" y="13" width="10" height="2.5" rx="1.25" fill="white" />
				<rect x="5" y="19" width="14" height="2.5" rx="1.25" fill="white" />
				<circle cx="23" cy="20" r="5" fill="white" fill-opacity="0.25" />
				<circle cx="23" cy="20" r="2.5" fill="white" />
			</svg>
		</div>
		{#if ui.sidebarOpen}
			<span class="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
				EnSocial
			</span>
		{/if}
	</div>

	<!-- Workspace switcher -->
	{#if ui.sidebarOpen}
		<button
			class="flex items-center gap-2 px-3 py-2.5 mx-2 mt-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
		>
			<div
				class="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold"
			>
				E
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-xs font-medium text-sidebar-foreground truncate">My Workspace</p>
				<p class="text-[10px] text-sidebar-muted-foreground truncate">Free Plan</p>
			</div>
			<ChevronDown class="size-3.5 shrink-0 text-sidebar-muted-foreground" />
		</button>
	{/if}

	<!-- Main nav -->
	<nav class="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
		{#each mainNav as item}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				class={cn(
					'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
					active
						? 'bg-sidebar-accent text-sidebar-foreground'
						: 'text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
				)}
				title={!ui.sidebarOpen ? item.label : undefined}
			>
				<svelte:component
					this={item.icon}
					class={cn('size-4 shrink-0', active ? 'text-primary' : 'text-current')}
				/>
				{#if ui.sidebarOpen}
					<span class="flex-1 truncate">{item.label}</span>
					{#if item.badge}
						<span
							class="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
						>
							{item.badge}
						</span>
					{/if}
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Bottom section -->
	<div class="border-t border-sidebar-border px-2 py-2 space-y-0.5">
		{#each bottomNav as item}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
					active
						? 'bg-sidebar-accent text-sidebar-foreground'
						: 'text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
				)}
				title={!ui.sidebarOpen ? item.label : undefined}
			>
				<svelte:component this={item.icon} class="size-4 shrink-0" />
				{#if ui.sidebarOpen}
					<span class="truncate">{item.label}</span>
				{/if}
			</a>
		{/each}
	</div>

	<!-- User -->
	<div class="border-t border-sidebar-border p-3">
		<button
			class="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors text-left"
		>
			<Avatar name="Henry Great" size="sm" />
			{#if ui.sidebarOpen}
				<div class="flex-1 min-w-0">
					<p class="text-xs font-medium text-sidebar-foreground truncate">Henry Great</p>
					<p class="text-[10px] text-sidebar-muted-foreground truncate">oyaincrease@gmail.com</p>
				</div>
				<LogOut class="size-3.5 shrink-0 text-sidebar-muted-foreground" />
			{/if}
		</button>
	</div>
</aside>

<!-- Mobile overlay -->
{#if ui.sidebarOpen}
	<button
		class="fixed inset-0 z-30 bg-black/50 lg:hidden"
		onclick={() => ui.toggleSidebar()}
		aria-label="Close sidebar"
	/>
{/if}
