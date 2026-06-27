<script lang="ts">
	import Button from '$components/ui/button.svelte';
	import Card from '$components/ui/card.svelte';
	import { ChevronLeft, ChevronRight, Plus } from 'lucide-svelte';

	let currentDate = $state(new Date());

	const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

	const currentMonth = $derived(currentDate.getMonth());
	const currentYear = $derived(currentDate.getFullYear());

	const calendarDays = $derived(() => {
		const firstDay = new Date(currentYear, currentMonth, 1).getDay();
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const days = [];
		for (let i = 0; i < firstDay; i++) days.push(null);
		for (let i = 1; i <= daysInMonth; i++) days.push(i);
		return days;
	});

	function prevMonth() {
		currentDate = new Date(currentYear, currentMonth - 1, 1);
	}
	function nextMonth() {
		currentDate = new Date(currentYear, currentMonth + 1, 1);
	}

	const today = new Date();

	// Placeholder scheduled posts
	const scheduledPosts: Record<number, { color: string; label: string }[]> = {
		26: [{ color: 'bg-blue-500', label: 'FB: Product update' }],
		28: [
			{ color: 'bg-pink-500', label: 'IG: Behind scenes' },
			{ color: 'bg-sky-500', label: 'TW: Thread' }
		],
		3: [{ color: 'bg-blue-700', label: 'LI: Article' }]
	};
</script>

<svelte:head>
	<title>Calendar — EnSocial</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Content Calendar</h1>
		<p class="text-sm text-muted-foreground mt-0.5">Plan and visualize your publishing schedule</p>
	</div>
	<Button href="/content/compose">
		<Plus class="size-4" />
		New Post
	</Button>
</div>

<Card class="overflow-hidden">
	<!-- Calendar header -->
	<div class="flex items-center justify-between border-b border-border px-6 py-4">
		<h2 class="text-base font-semibold text-foreground">
			{monthNames[currentMonth]} {currentYear}
		</h2>
		<div class="flex items-center gap-2">
			<button
				onclick={prevMonth}
				class="flex size-8 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
			>
				<ChevronLeft class="size-4" />
			</button>
			<button
				onclick={() => (currentDate = new Date())}
				class="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent transition-colors"
			>
				Today
			</button>
			<button
				onclick={nextMonth}
				class="flex size-8 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
			>
				<ChevronRight class="size-4" />
			</button>
		</div>
	</div>

	<!-- Day headers -->
	<div class="grid grid-cols-7 border-b border-border">
		{#each dayNames as day}
			<div class="py-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
		{/each}
	</div>

	<!-- Calendar grid -->
	<div class="grid grid-cols-7 divide-x divide-y divide-border">
		{#each calendarDays() as day}
			<div
				class="min-h-[100px] p-2 {day === null ? 'bg-muted/30' : 'hover:bg-accent/30 cursor-pointer transition-colors'}"
			>
				{#if day !== null}
					<div class="flex items-center justify-between mb-1">
						<span
							class="flex size-6 items-center justify-center rounded-full text-xs font-medium
							{day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
								? 'bg-primary text-primary-foreground'
								: 'text-foreground'}"
						>
							{day}
						</span>
						<button class="opacity-0 hover:opacity-100 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
							<Plus class="size-3" />
						</button>
					</div>
					{#if scheduledPosts[day]}
						<div class="space-y-1">
							{#each scheduledPosts[day] as post}
								<div class="flex items-center gap-1 rounded px-1 py-0.5 bg-accent">
									<div class="size-1.5 rounded-full shrink-0 {post.color}" />
									<span class="text-[10px] truncate text-foreground">{post.label}</span>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</Card>
