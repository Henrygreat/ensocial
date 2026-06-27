<script lang="ts">
	const { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 flex items-center justify-center p-4">
	<div class="w-full max-w-[420px]">
		<!-- Logo -->
		<div class="flex items-center justify-center gap-2.5 mb-8">
			<div class="flex size-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
				<svg viewBox="0 0 32 32" fill="none" class="size-6">
					<rect x="5" y="7" width="14" height="2.5" rx="1.25" fill="white" />
					<rect x="5" y="13" width="10" height="2.5" rx="1.25" fill="white" />
					<rect x="5" y="19" width="14" height="2.5" rx="1.25" fill="white" />
					<circle cx="23" cy="20" r="5" fill="white" fill-opacity="0.25" />
					<circle cx="23" cy="20" r="2.5" fill="white" />
				</svg>
			</div>
			<span class="text-xl font-semibold tracking-tight text-foreground">EnSocial</span>
		</div>

		{@render children()}
	</div>
</div>
