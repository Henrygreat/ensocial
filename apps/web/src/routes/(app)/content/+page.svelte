<script lang="ts">
	import Button from '$components/ui/button.svelte';
	import Card from '$components/ui/card.svelte';
	import Badge from '$components/ui/badge.svelte';
	import { Plus, Filter, Search, Grid2X2, List } from 'lucide-svelte';

	let view = $state<'grid' | 'list'>('list');
	let search = $state('');
	let filter = $state<'all' | 'draft' | 'scheduled' | 'published'>('all');

	const filters = [
		{ value: 'all', label: 'All' },
		{ value: 'draft', label: 'Drafts' },
		{ value: 'scheduled', label: 'Scheduled' },
		{ value: 'published', label: 'Published' }
	] as const;
</script>

<svelte:head>
	<title>Content — EnSocial</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Content Library</h1>
		<p class="text-sm text-muted-foreground mt-0.5">All your posts across every platform</p>
	</div>
	<Button href="/content/compose">
		<Plus class="size-4" />
		New Post
	</Button>
</div>

<!-- Filters -->
<div class="mb-6 flex items-center gap-3 flex-wrap">
	<div class="relative flex-1 min-w-[200px] max-w-sm">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
		<input
			bind:value={search}
			placeholder="Search posts..."
			class="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
		/>
	</div>
	<div class="flex items-center rounded-md border border-border overflow-hidden">
		{#each filters as f}
			<button
				onclick={() => (filter = f.value)}
				class="px-3 py-1.5 text-xs font-medium transition-colors {filter === f.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}"
			>
				{f.label}
			</button>
		{/each}
	</div>
	<div class="ml-auto flex items-center gap-1 rounded-md border border-border p-1">
		<button
			onclick={() => (view = 'list')}
			class="p-1.5 rounded {view === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground'}"
		>
			<List class="size-3.5" />
		</button>
		<button
			onclick={() => (view = 'grid')}
			class="p-1.5 rounded {view === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground'}"
		>
			<Grid2X2 class="size-3.5" />
		</button>
	</div>
</div>

<!-- Empty state placeholder -->
<Card class="flex flex-col items-center justify-center py-20 text-center">
	<div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
		<Plus class="size-7 text-primary" />
	</div>
	<h3 class="text-base font-semibold text-foreground">No posts yet</h3>
	<p class="mt-1 text-sm text-muted-foreground max-w-xs">
		Create your first post and schedule it to multiple platforms at once.
	</p>
	<Button class="mt-6" href="/content/compose">
		<Plus class="size-4" />
		Create your first post
	</Button>
</Card>
