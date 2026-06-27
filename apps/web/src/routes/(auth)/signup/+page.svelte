<script lang="ts">
	import Button from '$components/ui/button.svelte';
	import Input from '$components/ui/input.svelte';
	import Label from '$components/ui/label.svelte';
	import Separator from '$components/ui/separator.svelte';
	import { ArrowRight } from 'lucide-svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	async function handleSignup(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		// TODO: call signup API
		await new Promise((r) => setTimeout(r, 1000));
		loading = false;
	}
</script>

<svelte:head>
	<title>Create account — EnSocial</title>
</svelte:head>

<div class="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 p-8">
	<div class="mb-6">
		<h2 class="text-2xl font-semibold tracking-tight text-foreground">Create your account</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Start managing your social media with AI
		</p>
	</div>

	<!-- Google -->
	<Button variant="outline" class="w-full h-10" onclick={() => (window.location.href = '/api/auth/google')}>
		<svg viewBox="0 0 24 24" class="size-4">
			<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
			<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
			<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
			<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
		</svg>
		Sign up with Google
	</Button>

	<div class="my-5 flex items-center gap-3">
		<Separator />
		<span class="shrink-0 text-xs text-muted-foreground">or</span>
		<Separator />
	</div>

	<form onsubmit={handleSignup} class="space-y-4">
		<div class="space-y-1.5">
			<Label for="name">Full name</Label>
			<Input id="name" type="text" placeholder="Henry Great" bind:value={name} required />
		</div>
		<div class="space-y-1.5">
			<Label for="email">Work email</Label>
			<Input id="email" type="email" placeholder="henry@company.com" bind:value={email} required />
		</div>
		<div class="space-y-1.5">
			<Label for="password">Password</Label>
			<Input
				id="password"
				type="password"
				placeholder="At least 8 characters"
				bind:value={password}
				minlength={8}
				required
			/>
		</div>

		<Button type="submit" class="w-full" {loading}>
			Create account
			{#if !loading}<ArrowRight class="size-4" />{/if}
		</Button>
	</form>

	<p class="mt-4 text-center text-xs text-muted-foreground">
		By creating an account, you agree to our
		<a href="/terms" class="text-primary hover:underline">Terms</a>
		and
		<a href="/privacy" class="text-primary hover:underline">Privacy Policy</a>.
	</p>
</div>

<p class="mt-6 text-center text-sm text-muted-foreground">
	Already have an account?
	<a href="/login" class="font-medium text-primary hover:underline">Sign in</a>
</p>
