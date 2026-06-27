<script lang="ts">
	import Card from '$components/ui/card.svelte';
	import Button from '$components/ui/button.svelte';
	import Badge from '$components/ui/badge.svelte';
	import { Sparkles, Wand2, RefreshCw, Copy, Send, FileText, Hash, Repeat2, BarChart2 } from 'lucide-svelte';

	let prompt = $state('');
	let output = $state('');
	let generating = $state(false);
	let activeMode = $state<'generate' | 'repurpose' | 'hashtags' | 'analyze'>('generate');

	const modes = [
		{ id: 'generate', icon: Wand2, label: 'Generate' },
		{ id: 'repurpose', icon: Repeat2, label: 'Repurpose' },
		{ id: 'hashtags', icon: Hash, label: 'Hashtags' },
		{ id: 'analyze', icon: BarChart2, label: 'Analyze' }
	] as const;

	const placeholders: Record<typeof activeMode, string> = {
		generate: 'Describe the post you want to create... e.g. "A motivational post about overcoming challenges for my coaching audience"',
		repurpose: 'Paste your blog post, YouTube script, or long-form content here to repurpose for social media...',
		hashtags: 'Describe your content or paste your post to get relevant hashtag suggestions...',
		analyze: 'Paste your existing post to get AI feedback and improvement suggestions...'
	};

	const suggestions = [
		'Write 5 LinkedIn post ideas for a SaaS founder',
		'Create a Twitter thread about productivity tips',
		'Draft an Instagram caption for a product launch',
		'Write an engaging Facebook post about our company culture',
		'Generate 3 YouTube community post ideas'
	];

	async function generate() {
		if (!prompt.trim()) return;
		generating = true;
		output = '';
		// TODO: stream from Anthropic API via server action
		await new Promise((r) => setTimeout(r, 1500));
		output = `✨ Here's a post crafted for your audience:\n\n"The biggest mistake most founders make? Waiting until they're 'ready' to share their story.\n\nYour journey — with all its messy middle parts — is exactly what your audience needs to see.\n\nHere's why authentic content wins:\n→ It builds genuine trust\n→ It creates real connections\n→ It positions you as human, not just a brand\n\nStart sharing your story today. Not when it's perfect. Today.\n\nWhat's one behind-the-scenes truth you've been afraid to share? Drop it below 👇"\n\n---\n💡 Suggested posting time: Thursday 9 AM\n🎯 Best for: LinkedIn, Facebook\n#authenticity #founder #contentcreator #socialmedia`;
		generating = false;
	}

	async function copy() {
		await navigator.clipboard.writeText(output);
	}
</script>

<svelte:head>
	<title>AI Studio — EnSocial</title>
</svelte:head>

<div class="mb-6">
	<div class="flex items-center gap-2">
		<Sparkles class="size-5 text-primary" />
		<h1 class="text-2xl font-semibold text-foreground">AI Studio</h1>
		<Badge variant="default" class="ml-1">Powered by Claude</Badge>
	</div>
	<p class="text-sm text-muted-foreground mt-1">
		Generate, repurpose, and optimize your social media content with AI
	</p>
</div>

<!-- Mode selector -->
<div class="mb-6 flex items-center gap-2">
	{#each modes as mode}
		<button
			onclick={() => (activeMode = mode.id)}
			class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors {activeMode === mode.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
		>
			<svelte:component this={mode.icon} class="size-4" />
			{mode.label}
		</button>
	{/each}
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<!-- Input -->
	<div class="space-y-4">
		<Card class="p-4">
			<textarea
				bind:value={prompt}
				placeholder={placeholders[activeMode]}
				class="w-full min-h-[200px] resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed"
			></textarea>
			<div class="flex items-center justify-between mt-3 pt-3 border-t border-border">
				<span class="text-xs text-muted-foreground">{prompt.length} characters</span>
				<Button onclick={generate} loading={generating} disabled={!prompt.trim()}>
					<Wand2 class="size-4" />
					{generating ? 'Generating...' : 'Generate'}
				</Button>
			</div>
		</Card>

		<!-- Quick prompts -->
		<Card class="p-4">
			<p class="text-xs font-medium text-muted-foreground mb-3">QUICK PROMPTS</p>
			<div class="space-y-2">
				{#each suggestions as suggestion}
					<button
						onclick={() => (prompt = suggestion)}
						class="w-full text-left text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors"
					>
						{suggestion}
					</button>
				{/each}
			</div>
		</Card>
	</div>

	<!-- Output -->
	<Card class="flex flex-col">
		<div class="flex items-center justify-between border-b border-border px-4 py-3">
			<div class="flex items-center gap-2">
				<Sparkles class="size-4 text-primary" />
				<span class="text-sm font-medium text-foreground">Generated Content</span>
			</div>
			{#if output}
				<div class="flex items-center gap-2">
					<button
						onclick={copy}
						class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						<Copy class="size-3.5" />
						Copy
					</button>
					<Button size="sm" href="/content/compose">
						<Send class="size-3.5" />
						Use in composer
					</Button>
				</div>
			{/if}
		</div>
		<div class="flex-1 p-4">
			{#if generating}
				<div class="space-y-2">
					<div class="h-4 animate-pulse rounded bg-muted w-3/4" />
					<div class="h-4 animate-pulse rounded bg-muted w-full" />
					<div class="h-4 animate-pulse rounded bg-muted w-5/6" />
					<div class="h-4 animate-pulse rounded bg-muted w-2/3" />
					<div class="h-4 animate-pulse rounded bg-muted w-full" />
				</div>
			{:else if output}
				<pre class="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">{output}</pre>
			{:else}
				<div class="flex h-full flex-col items-center justify-center text-center py-12">
					<div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
						<Sparkles class="size-6 text-primary" />
					</div>
					<p class="text-sm font-medium text-foreground">Ready to generate</p>
					<p class="mt-1 text-xs text-muted-foreground">Enter a prompt and click Generate</p>
				</div>
			{/if}
		</div>
	</Card>
</div>
