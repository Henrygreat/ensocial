<script lang="ts">
	import Card from '$components/ui/card.svelte';
	import Badge from '$components/ui/badge.svelte';
	import Avatar from '$components/ui/avatar.svelte';
	import Button from '$components/ui/button.svelte';
	import Input from '$components/ui/input.svelte';
	import { Search, Send, Facebook, Instagram, Twitter } from 'lucide-svelte';
	import { formatRelative } from '$lib/utils';

	const conversations = [
		{ id: '1', name: 'Sarah Johnson', platform: 'INSTAGRAM', message: 'Love your latest post! Can you...', time: new Date(Date.now() - 5 * 60 * 1000), unread: 2 },
		{ id: '2', name: 'Mike Torres', platform: 'FACEBOOK', message: 'When is the next webinar?', time: new Date(Date.now() - 32 * 60 * 1000), unread: 0 },
		{ id: '3', name: 'Emma Davis', platform: 'TWITTER', message: '@mybrand Great content as always!', time: new Date(Date.now() - 2 * 60 * 60 * 1000), unread: 1 },
		{ id: '4', name: 'James Wilson', platform: 'INSTAGRAM', message: 'How can I get the discount code?', time: new Date(Date.now() - 5 * 60 * 60 * 1000), unread: 0 }
	];

	let selectedId = $state<string | null>('1');
	let reply = $state('');

	const platformIcons = { FACEBOOK: Facebook, INSTAGRAM: Instagram, TWITTER: Twitter };
	const platformColors = { FACEBOOK: 'text-blue-600', INSTAGRAM: 'text-pink-500', TWITTER: 'text-sky-500' };

	const selected = $derived(conversations.find((c) => c.id === selectedId));
</script>

<svelte:head>
	<title>Inbox — EnSocial</title>
</svelte:head>

<div class="mb-6">
	<h1 class="text-2xl font-semibold text-foreground">Inbox</h1>
	<p class="text-sm text-muted-foreground mt-0.5">All comments and messages in one place</p>
</div>

<div class="grid grid-cols-1 gap-0 lg:grid-cols-3 h-[600px] rounded-xl border border-border overflow-hidden">
	<!-- Conversation list -->
	<div class="border-r border-border flex flex-col">
		<div class="p-3 border-b border-border">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
				<input
					placeholder="Search conversations..."
					class="w-full h-8 rounded-md bg-accent pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground"
				/>
			</div>
		</div>
		<div class="flex-1 overflow-y-auto">
			{#each conversations as conv}
				<button
					onclick={() => (selectedId = conv.id)}
					class="w-full flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-accent transition-colors text-left {selectedId === conv.id ? 'bg-accent' : ''}"
				>
					<Avatar name={conv.name} size="sm" />
					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between gap-2">
							<span class="text-xs font-medium text-foreground truncate">{conv.name}</span>
							<span class="text-[10px] text-muted-foreground shrink-0">{formatRelative(conv.time)}</span>
						</div>
						<div class="flex items-center gap-1.5 mt-0.5">
							<svelte:component
								this={platformIcons[conv.platform as keyof typeof platformIcons] ?? Facebook}
								class="size-3 shrink-0 {platformColors[conv.platform as keyof typeof platformColors]}"
							/>
							<p class="text-[11px] text-muted-foreground truncate">{conv.message}</p>
						</div>
					</div>
					{#if conv.unread > 0}
						<span class="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
							{conv.unread}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Conversation view -->
	<div class="lg:col-span-2 flex flex-col">
		{#if selected}
			<div class="flex items-center gap-3 border-b border-border px-4 py-3">
				<Avatar name={selected.name} size="sm" />
				<div>
					<p class="text-sm font-medium text-foreground">{selected.name}</p>
					<p class="text-xs text-muted-foreground capitalize">{selected.platform.toLowerCase()}</p>
				</div>
				<div class="ml-auto flex items-center gap-2">
					<Badge variant="secondary">Open</Badge>
					<button class="text-xs text-muted-foreground hover:text-foreground">Assign</button>
				</div>
			</div>
			<div class="flex-1 overflow-y-auto p-4 space-y-4">
				<div class="flex justify-start">
					<div class="max-w-[75%] rounded-2xl rounded-tl-sm bg-accent px-4 py-2.5">
						<p class="text-sm text-foreground">{selected.message}</p>
						<p class="text-[10px] text-muted-foreground mt-1">{formatRelative(selected.time)}</p>
					</div>
				</div>
			</div>
			<div class="border-t border-border p-3">
				<div class="flex items-center gap-2">
					<input
						bind:value={reply}
						placeholder="Type a reply..."
						class="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
					/>
					<Button size="icon" disabled={!reply.trim()}>
						<Send class="size-4" />
					</Button>
				</div>
			</div>
		{:else}
			<div class="flex-1 flex items-center justify-center text-muted-foreground">
				Select a conversation
			</div>
		{/if}
	</div>
</div>
