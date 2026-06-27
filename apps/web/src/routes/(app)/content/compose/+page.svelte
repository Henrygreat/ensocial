<script lang="ts">
	import Button from '$components/ui/button.svelte';
	import Card from '$components/ui/card.svelte';
	import Badge from '$components/ui/badge.svelte';
	import Separator from '$components/ui/separator.svelte';
	import { cn } from '$lib/utils';
	import { PLATFORM_CHAR_LIMITS, PLATFORM_LABELS } from '@ensocial/types';
	import type { SocialPlatform } from '@ensocial/types';
	import {
		Sparkles,
		Image,
		Hash,
		Link,
		Smile,
		ChevronDown,
		CalendarDays,
		Clock,
		Send,
		Save,
		ArrowLeft,
		Wand2,
		RefreshCw,
		X,
		Facebook,
		Instagram,
		Twitter,
		Linkedin,
		Youtube,
		PinIcon
	} from 'lucide-svelte';

	// Platform state
	const platforms: SocialPlatform[] = ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN'];
	let selectedPlatforms = $state<Set<SocialPlatform>>(new Set(['FACEBOOK', 'INSTAGRAM', 'TWITTER']));

	// Content state
	let body = $state('');
	let aiPrompt = $state('');
	let aiGenerating = $state(false);
	let scheduleDate = $state('');
	let scheduleTime = $state('09:00');
	let mode = $state<'compose' | 'preview'>('compose');
	let activePreviewPlatform = $state<SocialPlatform>('INSTAGRAM');

	// Character counts per platform
	const charCounts = $derived(
		platforms.reduce(
			(acc, p) => {
				acc[p] = PLATFORM_CHAR_LIMITS[p] - body.length;
				return acc;
			},
			{} as Record<SocialPlatform, number>
		)
	);

	// Smallest limit among selected platforms
	const minLimit = $derived(
		Math.min(...Array.from(selectedPlatforms).map((p) => PLATFORM_CHAR_LIMITS[p]))
	);

	const charPercent = $derived(Math.min((body.length / minLimit) * 100, 100));
	const charColor = $derived(
		charPercent >= 100
			? 'text-destructive'
			: charPercent >= 90
				? 'text-warning'
				: 'text-muted-foreground'
	);

	function togglePlatform(platform: SocialPlatform) {
		if (selectedPlatforms.has(platform)) {
			if (selectedPlatforms.size === 1) return; // keep at least one
			selectedPlatforms.delete(platform);
		} else {
			selectedPlatforms.add(platform);
		}
		selectedPlatforms = new Set(selectedPlatforms);
	}

	async function generateWithAI() {
		if (!aiPrompt.trim()) return;
		aiGenerating = true;
		// TODO: call Anthropic API via server action
		await new Promise((r) => setTimeout(r, 1800));
		body =
			'✨ Excited to share something incredible with our community today!\n\nWe\'ve been working behind the scenes on something that\'s going to transform how you manage your social media presence. Stay tuned for the big reveal this Thursday!\n\nDrop a 🔥 if you\'re ready for what\'s coming.\n\n#SocialMedia #ContentCreator #ComingSoon';
		aiGenerating = false;
	}

	const platformIcons: Record<SocialPlatform, typeof Facebook> = {
		FACEBOOK: Facebook,
		INSTAGRAM: Instagram,
		TWITTER: Twitter,
		LINKEDIN: Linkedin,
		TIKTOK: Twitter, // placeholder
		YOUTUBE: Youtube,
		PINTEREST: PinIcon,
		THREADS: Twitter, // placeholder
		GOOGLE_BUSINESS: Twitter // placeholder
	};

	const platformColors: Record<SocialPlatform, string> = {
		FACEBOOK: 'text-blue-600',
		INSTAGRAM: 'text-pink-500',
		TWITTER: 'text-sky-500',
		LINKEDIN: 'text-blue-700',
		TIKTOK: 'text-gray-900 dark:text-white',
		YOUTUBE: 'text-red-600',
		PINTEREST: 'text-red-500',
		THREADS: 'text-gray-900 dark:text-white',
		GOOGLE_BUSINESS: 'text-blue-500'
	};
</script>

<svelte:head>
	<title>Compose — EnSocial</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6 flex items-center justify-between">
	<div class="flex items-center gap-3">
		<a
			href="/content"
			class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
		>
			<ArrowLeft class="size-4" />
		</a>
		<div>
			<h1 class="text-lg font-semibold text-foreground">New Post</h1>
			<p class="text-xs text-muted-foreground">Compose and schedule to multiple platforms</p>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<Button variant="ghost" size="sm">
			<Save class="size-4" />
			Save draft
		</Button>
		<Button variant="outline" size="sm" onclick={() => (mode = mode === 'compose' ? 'preview' : 'compose')}>
			{mode === 'compose' ? 'Preview' : 'Edit'}
		</Button>
		<Button size="sm" disabled={!body.trim() || selectedPlatforms.size === 0}>
			<Send class="size-4" />
			{scheduleDate ? 'Schedule' : 'Publish now'}
		</Button>
	</div>
</div>

<!-- Platform selector -->
<div class="mb-6">
	<p class="text-xs font-medium text-muted-foreground mb-2">POST TO</p>
	<div class="flex items-center gap-2 flex-wrap">
		{#each platforms as platform}
			{@const selected = selectedPlatforms.has(platform)}
			<button
				onclick={() => togglePlatform(platform)}
				class={cn(
					'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
					selected
						? 'border-primary bg-primary/10 text-foreground shadow-sm'
						: 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
				)}
			>
				<svelte:component
					this={platformIcons[platform]}
					class={cn('size-4', selected ? platformColors[platform] : 'text-current')}
				/>
				{PLATFORM_LABELS[platform]}
				{#if selected}
					<span class={cn('text-xs font-normal', charCounts[platform] < 0 ? 'text-destructive' : 'text-muted-foreground')}>
						{charCounts[platform]}
					</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<!-- Main compose area -->
<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
	<!-- Compose panel (2 cols) -->
	<div class="lg:col-span-2 space-y-4">
		<Card class="overflow-hidden">
			<!-- Editor -->
			<div class="p-4">
				<textarea
					bind:value={body}
					placeholder="What do you want to share? Start typing or use AI to generate content..."
					class="w-full min-h-[200px] resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground outline-none"
				></textarea>
			</div>

			<!-- Media area -->
			<div class="border-t border-border p-4">
				<button
					class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
				>
					<Image class="size-5" />
					Click to upload images or videos, or drag & drop
				</button>
			</div>

			<!-- Toolbar -->
			<div class="flex items-center justify-between border-t border-border px-4 py-3">
				<div class="flex items-center gap-1">
					<button
						class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
						title="Add image"
					>
						<Image class="size-4" />
					</button>
					<button
						class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
						title="Add hashtags"
					>
						<Hash class="size-4" />
					</button>
					<button
						class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
						title="Add link"
					>
						<Link class="size-4" />
					</button>
					<button
						class="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
						title="Add emoji"
					>
						<Smile class="size-4" />
					</button>
				</div>

				<!-- Char count -->
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2">
						<div class="relative size-6">
							<svg class="size-6 -rotate-90" viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="10" fill="none" stroke="var(--border)" stroke-width="2.5" />
								<circle
									cx="12"
									cy="12"
									r="10"
									fill="none"
									stroke={charPercent >= 100 ? 'hsl(var(--destructive))' : charPercent >= 90 ? 'hsl(var(--warning))' : 'hsl(var(--primary))'}
									stroke-width="2.5"
									stroke-dasharray={`${charPercent * 0.628} 62.8`}
								/>
							</svg>
						</div>
						<span class={cn('text-xs font-medium', charColor)}>
							{minLimit - body.length}
						</span>
					</div>
				</div>
			</div>
		</Card>

		<!-- First comment (for Instagram/Facebook) -->
		{#if selectedPlatforms.has('INSTAGRAM') || selectedPlatforms.has('FACEBOOK')}
			<Card class="p-4">
				<p class="text-xs font-medium text-muted-foreground mb-2">FIRST COMMENT (Instagram / Facebook)</p>
				<textarea
					placeholder="Add hashtags or extra context as a first comment..."
					class="w-full min-h-[60px] resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
				></textarea>
			</Card>
		{/if}
	</div>

	<!-- Right panel -->
	<div class="space-y-4">
		<!-- AI Studio -->
		<Card class="overflow-hidden">
			<div class="flex items-center gap-2 border-b border-border px-4 py-3">
				<Sparkles class="size-4 text-primary" />
				<h3 class="text-sm font-semibold text-foreground">AI Studio</h3>
				<Badge variant="default" class="ml-auto text-[10px]">Claude</Badge>
			</div>
			<div class="p-4 space-y-3">
				<textarea
					bind:value={aiPrompt}
					placeholder="Describe what you want to post about..."
					class="w-full min-h-[80px] resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
				></textarea>
				<div class="flex gap-2">
					<Button
						size="sm"
						class="flex-1"
						onclick={generateWithAI}
						loading={aiGenerating}
						disabled={!aiPrompt.trim()}
					>
						<Wand2 class="size-3.5" />
						Generate
					</Button>
					{#if body}
						<Button variant="outline" size="sm" onclick={generateWithAI} loading={aiGenerating}>
							<RefreshCw class="size-3.5" />
						</Button>
					{/if}
				</div>

				{#if body}
					<Separator />
					<div class="space-y-2">
						<p class="text-xs font-medium text-muted-foreground">QUICK ACTIONS</p>
						<div class="flex flex-wrap gap-1.5">
							{#each ['Make shorter', 'More engaging', 'Add emojis', 'Professional tone', 'Casual tone'] as action}
								<button
									class="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
								>
									{action}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Hashtags -->
		<Card class="p-4">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-foreground">Hashtags</h3>
				<button class="text-xs text-primary hover:underline">AI suggest</button>
			</div>
			<div class="flex flex-wrap gap-1.5">
				{#each ['#socialmedia', '#contentcreator', '#marketing', '#digitalmarketing', '#brand'] as tag}
					<button
						class="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
					>
						{tag}
						<X class="size-2.5" />
					</button>
				{/each}
			</div>
		</Card>

		<!-- Schedule -->
		<Card class="p-4">
			<div class="flex items-center gap-2 mb-3">
				<CalendarDays class="size-4 text-muted-foreground" />
				<h3 class="text-sm font-semibold text-foreground">Schedule</h3>
			</div>
			<div class="space-y-3">
				<div>
					<label class="text-xs text-muted-foreground block mb-1">Date</label>
					<input
						type="date"
						bind:value={scheduleDate}
						min={new Date().toISOString().split('T')[0]}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
					/>
				</div>
				<div>
					<label class="text-xs text-muted-foreground block mb-1">Time</label>
					<input
						type="time"
						bind:value={scheduleTime}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
					/>
				</div>
				<div class="rounded-lg bg-primary/5 border border-primary/20 p-3">
					<p class="text-xs text-foreground flex items-center gap-1.5">
						<Sparkles class="size-3 text-primary" />
						<span>AI recommends <strong>Thu 9:00 AM</strong> for 2x engagement</span>
					</p>
					<button
						class="mt-2 text-xs text-primary hover:underline"
						onclick={() => {
							const next = new Date();
							next.setDate(next.getDate() + ((4 - next.getDay() + 7) % 7 || 7));
							scheduleDate = next.toISOString().split('T')[0];
							scheduleTime = '09:00';
						}}
					>
						Use this time
					</button>
				</div>
			</div>
		</Card>

		<!-- Publish actions (sticky) -->
		<div class="space-y-2">
			<Button class="w-full" disabled={!body.trim()}>
				<Send class="size-4" />
				{scheduleDate ? `Schedule for ${scheduleDate}` : 'Publish now'}
			</Button>
			<Button variant="outline" class="w-full">
				<Save class="size-4" />
				Save as draft
			</Button>
		</div>
	</div>
</div>
