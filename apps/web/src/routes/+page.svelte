<script lang="ts">
	const features = [
		{ title: 'AI content studio', body: 'Generate captions, hooks, hashtags, and campaign variants from one brand-aware workspace.' },
		{ title: 'Modern publishing calendar', body: 'Plan drafts, approvals, scheduled posts, and channel-specific variations in one clean timeline.' },
		{ title: 'Agency workspaces', body: 'Separate clients, roles, assets, approvals, and reports without duplicating your team setup.' },
		{ title: 'Built for automation', body: 'Redis-backed workers handle publishing, analytics sync, notifications, and future AI agents.' }
	];
</script>

<svelte:head>
	<title>EnSocial — AI social media operating system</title>
	<meta name="description" content="Plan, create, schedule and analyze social content with an AI-first social media workspace." />
</svelte:head>

<main class="min-h-screen overflow-hidden bg-background text-foreground">
	<section class="relative isolate border-b border-border">
		<div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,1))]"></div>
		<nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
			<a href="/" class="flex items-center gap-3 font-semibold tracking-tight">
				<span class="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">E</span>
				<span>EnSocial</span>
			</a>
			<div class="flex items-center gap-3">
				<a href="/login" class="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</a>
				<a href="/signup" class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">Start free</a>
			</div>
		</nav>

		<div class="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-20">
			<div>
				<p class="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">AI-first social media management</p>
				<h1 class="mt-7 max-w-4xl text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">Create, schedule, and grow every social channel from one workspace.</h1>
				<p class="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">EnSocial is a modern alternative to legacy social tools: faster content planning, cleaner approvals, AI writing, workspace permissions, and a queue-ready backend for serious teams.</p>
				<div class="mt-10 flex flex-wrap gap-4">
					<a href="/signup" class="rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/25">Create workspace</a>
					<a href="/dashboard" class="rounded-2xl border border-border bg-card px-6 py-4 text-sm font-bold shadow-sm">View dashboard</a>
				</div>
			</div>

			<div class="rounded-[2rem] border border-border bg-card/90 p-4 shadow-2xl shadow-primary/10 backdrop-blur">
				<div class="rounded-[1.5rem] border border-border bg-background p-5">
					<div class="flex items-center justify-between border-b border-border pb-4">
						<div>
							<p class="text-sm font-semibold">Campaign calendar</p>
							<p class="text-xs text-muted-foreground">This week</p>
						</div>
						<span class="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">Ready</span>
					</div>
					<div class="mt-5 grid gap-3">
						{#each ['LinkedIn launch post', 'Instagram carousel', 'X thread', 'YouTube community post'] as item, i}
							<div class="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
								<div>
									<p class="font-semibold">{item}</p>
									<p class="text-xs text-muted-foreground">AI score {92 - i * 4}% · scheduled</p>
								</div>
								<div class="size-10 rounded-xl bg-primary/20" style={`opacity: ${0.35 + i * 0.15}`}></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-6 py-16 lg:px-8">
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{#each features as feature}
				<article class="rounded-3xl border border-border bg-card p-6 shadow-sm">
					<h2 class="font-bold tracking-tight">{feature.title}</h2>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">{feature.body}</p>
				</article>
			{/each}
		</div>
	</section>
</main>
