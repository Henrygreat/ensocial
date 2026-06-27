<script lang="ts">
	import Card from '$components/ui/card.svelte';
	import Badge from '$components/ui/badge.svelte';
	import Button from '$components/ui/button.svelte';
	import { TrendingUp, TrendingDown, Users, Eye, Heart, MessageSquare, Share2 } from 'lucide-svelte';
	import { formatNumber } from '$lib/utils';

	const metrics = [
		{ label: 'Total Reach', value: 48200, change: 12.4, icon: Eye },
		{ label: 'Followers', value: 12840, change: 3.2, icon: Users },
		{ label: 'Engagements', value: 2148, change: -1.8, icon: Heart },
		{ label: 'Link Clicks', value: 892, change: 28.5, icon: Share2 }
	];

	let period = $state<'7d' | '30d' | '90d'>('30d');
</script>

<svelte:head>
	<title>Analytics — EnSocial</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Analytics</h1>
		<p class="text-sm text-muted-foreground mt-0.5">Track your social media performance</p>
	</div>
	<div class="flex items-center rounded-md border border-border overflow-hidden">
		{#each [{ v: '7d', l: '7 days' }, { v: '30d', l: '30 days' }, { v: '90d', l: '90 days' }] as p}
			<button
				onclick={() => (period = p.v as typeof period)}
				class="px-3 py-1.5 text-xs font-medium transition-colors {period === p.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}"
			>
				{p.l}
			</button>
		{/each}
	</div>
</div>

<!-- Metrics grid -->
<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
	{#each metrics as metric}
		<Card class="p-5">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{metric.label}</p>
					<p class="mt-1 text-3xl font-bold tracking-tight text-foreground">
						{formatNumber(metric.value)}
					</p>
					<div class="mt-1 flex items-center gap-1">
						{#if metric.change >= 0}
							<TrendingUp class="size-3.5 text-success" />
							<span class="text-xs text-success">+{metric.change}%</span>
						{:else}
							<TrendingDown class="size-3.5 text-destructive" />
							<span class="text-xs text-destructive">{metric.change}%</span>
						{/if}
						<span class="text-xs text-muted-foreground">vs last period</span>
					</div>
				</div>
				<div class="flex size-10 items-center justify-center rounded-xl bg-primary/10">
					<svelte:component this={metric.icon} class="size-5 text-primary" />
				</div>
			</div>
		</Card>
	{/each}
</div>

<!-- Chart placeholder -->
<Card class="p-6">
	<h3 class="text-base font-semibold text-foreground mb-4">Engagement Over Time</h3>
	<div class="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
		<p class="text-sm text-muted-foreground">Chart coming soon — integrating analytics data</p>
	</div>
</Card>
