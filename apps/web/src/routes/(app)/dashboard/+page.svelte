<script lang="ts">
	import Card from '$components/ui/card.svelte';
	import Badge from '$components/ui/badge.svelte';
	import Button from '$components/ui/button.svelte';
	import Avatar from '$components/ui/avatar.svelte';
	import Skeleton from '$components/ui/skeleton.svelte';
	import { formatRelative, formatNumber } from '$lib/utils';
	import {
		CalendarClock,
		Plug2,
		TrendingUp,
		Sparkles,
		ArrowRight,
		Plus,
		Facebook,
		Instagram,
		Twitter,
		Linkedin,
		Clock,
		CheckCircle2,
		XCircle,
		AlertCircle
	} from 'lucide-svelte';

	const stats = [
		{
			label: 'Scheduled Posts',
			value: '12',
			change: '+3 this week',
			trend: 'up',
			icon: CalendarClock,
			color: 'text-blue-500',
			bg: 'bg-blue-50 dark:bg-blue-950/30'
		},
		{
			label: 'Connected Accounts',
			value: '8',
			change: 'Across 5 platforms',
			trend: 'neutral',
			icon: Plug2,
			color: 'text-violet-500',
			bg: 'bg-violet-50 dark:bg-violet-950/30'
		},
		{
			label: 'Avg. Engagement',
			value: '4.2%',
			change: '+0.8% vs last week',
			trend: 'up',
			icon: TrendingUp,
			color: 'text-emerald-500',
			bg: 'bg-emerald-50 dark:bg-emerald-950/30'
		},
		{
			label: 'AI Credits',
			value: '850',
			change: '150 used this month',
			trend: 'neutral',
			icon: Sparkles,
			color: 'text-amber-500',
			bg: 'bg-amber-50 dark:bg-amber-950/30'
		}
	];

	const recentPosts = [
		{
			id: '1',
			body: 'Excited to share our latest product update! We\'ve been working hard on making social media management easier for everyone...',
			platforms: ['FACEBOOK', 'INSTAGRAM', 'TWITTER'],
			status: 'PUBLISHED',
			publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
			engagement: { likes: 248, comments: 34, shares: 18 }
		},
		{
			id: '2',
			body: '5 tips for growing your LinkedIn presence in 2026 — a thread for creators and professionals...',
			platforms: ['LINKEDIN', 'TWITTER'],
			status: 'SCHEDULED',
			scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
			engagement: null
		},
		{
			id: '3',
			body: 'Behind the scenes of our creative process. Here\'s how we plan 30 days of content in just one afternoon...',
			platforms: ['INSTAGRAM'],
			status: 'DRAFT',
			publishedAt: null,
			engagement: null
		},
		{
			id: '4',
			body: 'Join us for our FREE webinar on AI-powered social media strategy. Limited spots available...',
			platforms: ['FACEBOOK', 'LINKEDIN'],
			status: 'PENDING_APPROVAL',
			scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			engagement: null
		}
	];

	const platformIcons: Record<string, typeof Facebook> = {
		FACEBOOK: Facebook,
		INSTAGRAM: Instagram,
		TWITTER: Twitter,
		LINKEDIN: Linkedin
	};

	const platformColors: Record<string, string> = {
		FACEBOOK: 'text-blue-600',
		INSTAGRAM: 'text-pink-500',
		TWITTER: 'text-sky-500',
		LINKEDIN: 'text-blue-700'
	};

	const statusConfig = {
		PUBLISHED: { label: 'Published', variant: 'success' as const, icon: CheckCircle2 },
		SCHEDULED: { label: 'Scheduled', variant: 'default' as const, icon: Clock },
		DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: AlertCircle },
		PENDING_APPROVAL: { label: 'Pending', variant: 'warning' as const, icon: AlertCircle },
		FAILED: { label: 'Failed', variant: 'destructive' as const, icon: XCircle }
	};

	function getGreeting(): string {
		const h = new Date().getHours();
		if (h < 12) return 'Good morning';
		if (h < 18) return 'Good afternoon';
		return 'Good evening';
	}
</script>

<svelte:head>
	<title>Dashboard — EnSocial</title>
</svelte:head>

<!-- Welcome header -->
<div class="mb-8 flex items-start justify-between">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{getGreeting()}, Henry 👋
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Here's what's happening with your social media today.
		</p>
	</div>
	<Button href="/content/compose">
		<Plus class="size-4" />
		New Post
	</Button>
</div>

<!-- Stats grid -->
<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
	{#each stats as stat}
		<Card class="p-5">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{stat.label}</p>
					<p class="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
					<p class="mt-1 text-xs text-muted-foreground">{stat.change}</p>
				</div>
				<div class={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}>
					<svelte:component this={stat.icon} class={`size-5 ${stat.color}`} />
				</div>
			</div>
		</Card>
	{/each}
</div>

<!-- Main content grid -->
<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
	<!-- Recent posts (2 cols) -->
	<div class="lg:col-span-2 space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-base font-semibold text-foreground">Recent Posts</h2>
			<a href="/content" class="text-sm text-primary hover:underline flex items-center gap-1">
				View all <ArrowRight class="size-3" />
			</a>
		</div>

		<div class="space-y-3">
			{#each recentPosts as post}
				{@const config = statusConfig[post.status as keyof typeof statusConfig]}
				<Card class="p-4 hover:border-primary/30 transition-colors cursor-pointer">
					<div class="flex items-start gap-4">
						<div class="flex-1 min-w-0">
							<p class="text-sm text-foreground line-clamp-2">{post.body}</p>

							<div class="mt-3 flex items-center gap-3 flex-wrap">
								<!-- Platform icons -->
								<div class="flex items-center gap-1.5">
									{#each post.platforms as platform}
										<svelte:component
											this={platformIcons[platform] ?? Facebook}
											class={`size-3.5 ${platformColors[platform] ?? 'text-muted-foreground'}`}
										/>
									{/each}
								</div>

								<!-- Status badge -->
								<Badge variant={config.variant} class="gap-1">
									<svelte:component this={config.icon} class="size-2.5" />
									{config.label}
								</Badge>

								<!-- Time -->
								{#if post.publishedAt}
									<span class="text-xs text-muted-foreground">
										{formatRelative(post.publishedAt)}
									</span>
								{:else if post.scheduledAt}
									<span class="text-xs text-muted-foreground">
										Scheduled {formatRelative(post.scheduledAt)}
									</span>
								{/if}
							</div>

							<!-- Engagement stats (published only) -->
							{#if post.engagement}
								<div class="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
									<span>❤️ {formatNumber(post.engagement.likes)}</span>
									<span>💬 {formatNumber(post.engagement.comments)}</span>
									<span>🔁 {formatNumber(post.engagement.shares)}</span>
								</div>
							{/if}
						</div>
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<!-- Right sidebar -->
	<div class="space-y-6">
		<!-- Quick compose -->
		<Card class="p-4">
			<h3 class="text-sm font-semibold text-foreground mb-3">Quick Compose</h3>
			<textarea
				placeholder="What do you want to share today?"
				class="w-full text-sm bg-transparent resize-none border-0 outline-none text-foreground placeholder:text-muted-foreground min-h-[80px]"
			></textarea>
			<div class="flex items-center justify-between mt-3 pt-3 border-t border-border">
				<div class="flex items-center gap-2">
					<button class="text-muted-foreground hover:text-foreground transition-colors">
						<Sparkles class="size-4" />
					</button>
				</div>
				<Button size="sm" href="/content/compose">Open composer</Button>
			</div>
		</Card>

		<!-- Connected accounts -->
		<Card class="p-4">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-foreground">Accounts</h3>
				<a href="/connections" class="text-xs text-primary hover:underline">Manage</a>
			</div>
			<div class="space-y-2.5">
				{#each [
					{ platform: 'Facebook', handle: '@mybrand', icon: Facebook, color: 'text-blue-600', status: 'connected' },
					{ platform: 'Instagram', handle: '@mybrand', icon: Instagram, color: 'text-pink-500', status: 'connected' },
					{ platform: 'X (Twitter)', handle: '@mybrand', icon: Twitter, color: 'text-sky-500', status: 'connected' },
					{ platform: 'LinkedIn', handle: 'My Company', icon: Linkedin, color: 'text-blue-700', status: 'expiring' }
				] as account}
					<div class="flex items-center gap-3">
						<svelte:component this={account.icon} class={`size-4 shrink-0 ${account.color}`} />
						<div class="flex-1 min-w-0">
							<p class="text-xs font-medium text-foreground truncate">{account.handle}</p>
							<p class="text-[10px] text-muted-foreground">{account.platform}</p>
						</div>
						{#if account.status === 'expiring'}
							<Badge variant="warning" class="text-[10px]">Refresh</Badge>
						{:else}
							<div class="size-2 rounded-full bg-success" />
						{/if}
					</div>
				{/each}
			</div>
			<Button variant="outline" size="sm" class="w-full mt-4" href="/connections">
				<Plus class="size-3.5" />
				Add account
			</Button>
		</Card>

		<!-- AI suggestion -->
		<Card class="p-4 border-primary/20 bg-primary/5">
			<div class="flex items-center gap-2 mb-3">
				<Sparkles class="size-4 text-primary" />
				<h3 class="text-sm font-semibold text-foreground">AI Suggestion</h3>
			</div>
			<p class="text-xs text-muted-foreground leading-relaxed">
				Based on your analytics, posting on <strong class="text-foreground">Thursday at 9 AM</strong>
				gets 2x your average engagement. You have a slot open this Thursday.
			</p>
			<Button variant="outline" size="sm" class="mt-3 w-full" href="/content/compose">
				Schedule for Thursday
			</Button>
		</Card>
	</div>
</div>
