<script lang="ts">
	import Card from '$components/ui/card.svelte';
	import Badge from '$components/ui/badge.svelte';
	import Button from '$components/ui/button.svelte';
	import { Plus, RefreshCw, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube, ExternalLink } from 'lucide-svelte';
	import { PLATFORM_LABELS } from '@ensocial/types';
	import type { SocialPlatform } from '@ensocial/types';

	const connected = [
		{ id: '1', platform: 'FACEBOOK' as SocialPlatform, name: 'My Brand Page', handle: '@mybrand', followers: 12400, status: 'active' },
		{ id: '2', platform: 'INSTAGRAM' as SocialPlatform, name: 'My Brand', handle: '@mybrand', followers: 8900, status: 'active' },
		{ id: '3', platform: 'TWITTER' as SocialPlatform, name: 'My Brand', handle: '@mybrand', followers: 5200, status: 'active' },
		{ id: '4', platform: 'LINKEDIN' as SocialPlatform, name: 'My Company', handle: 'My Company', followers: 3100, status: 'expiring' }
	];

	const available: SocialPlatform[] = ['YOUTUBE', 'TIKTOK', 'PINTEREST', 'THREADS', 'GOOGLE_BUSINESS'];

	const icons: Partial<Record<SocialPlatform, typeof Facebook>> = {
		FACEBOOK: Facebook,
		INSTAGRAM: Instagram,
		TWITTER: Twitter,
		LINKEDIN: Linkedin,
		YOUTUBE: Youtube
	};

	const colors: Partial<Record<SocialPlatform, string>> = {
		FACEBOOK: 'text-blue-600',
		INSTAGRAM: 'text-pink-500',
		TWITTER: 'text-sky-500',
		LINKEDIN: 'text-blue-700',
		YOUTUBE: 'text-red-600'
	};
</script>

<svelte:head>
	<title>Connections — EnSocial</title>
</svelte:head>

<div class="mb-6">
	<h1 class="text-2xl font-semibold text-foreground">Social Connections</h1>
	<p class="text-sm text-muted-foreground mt-0.5">Manage your connected social media accounts</p>
</div>

<!-- Connected accounts -->
<div class="mb-8">
	<h2 class="text-sm font-semibold text-foreground mb-3">Connected Accounts</h2>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
		{#each connected as account}
			<Card class="p-4">
				<div class="flex items-start justify-between mb-3">
					<div class="flex items-center gap-3">
						<div class="flex size-10 items-center justify-center rounded-xl bg-accent">
							<svelte:component
								this={icons[account.platform] ?? Facebook}
								class="size-5 {colors[account.platform] ?? 'text-muted-foreground'}"
							/>
						</div>
						<div>
							<p class="text-sm font-medium text-foreground">{account.name}</p>
							<p class="text-xs text-muted-foreground">{PLATFORM_LABELS[account.platform]}</p>
						</div>
					</div>
					{#if account.status === 'expiring'}
						<Badge variant="warning">Refresh</Badge>
					{:else}
						<Badge variant="success">Active</Badge>
					{/if}
				</div>
				<div class="flex items-center justify-between text-xs text-muted-foreground">
					<span>{account.handle}</span>
					<span>{(account.followers / 1000).toFixed(1)}K followers</span>
				</div>
				<div class="mt-3 flex items-center gap-2">
					<Button variant="outline" size="sm" class="flex-1">
						<RefreshCw class="size-3.5" />
						Reconnect
					</Button>
					<Button variant="ghost" size="icon" class="text-destructive hover:text-destructive">
						<Trash2 class="size-3.5" />
					</Button>
				</div>
			</Card>
		{/each}
	</div>
</div>

<!-- Available platforms -->
<div>
	<h2 class="text-sm font-semibold text-foreground mb-3">Add More Accounts</h2>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
		{#each available as platform}
			<Card class="p-4 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center rounded-xl bg-accent">
						<svelte:component
							this={icons[platform] ?? Plus}
							class="size-5 {colors[platform] ?? 'text-muted-foreground'}"
						/>
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">{PLATFORM_LABELS[platform]}</p>
						<p class="text-xs text-muted-foreground">Not connected</p>
					</div>
				</div>
				<Button variant="outline" size="sm">
					<Plus class="size-3.5" />
					Connect
				</Button>
			</Card>
		{/each}
	</div>
</div>
