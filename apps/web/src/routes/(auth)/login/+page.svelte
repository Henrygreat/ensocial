<script lang="ts">
	import Button from '$components/ui/button.svelte';
	import Input from '$components/ui/input.svelte';
	import Label from '$components/ui/label.svelte';
	import Separator from '$components/ui/separator.svelte';
	import { Eye, EyeOff, Mail, ArrowRight } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let magicLinkSent = $state(false);

	async function handleEmailLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		// TODO: call API
		await new Promise((r) => setTimeout(r, 1000));
		loading = false;
	}

	async function handleMagicLink() {
		if (!email) return;
		loading = true;
		// TODO: call magic link API
		await new Promise((r) => setTimeout(r, 1000));
		magicLinkSent = true;
		loading = false;
	}

	async function handleGoogleLogin() {
		// TODO: initiate Google OAuth flow
		window.location.href = '/api/auth/google';
	}
</script>

<svelte:head>
	<title>Sign in — EnSocial</title>
</svelte:head>

<div class="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 p-8">
	{#if magicLinkSent}
		<!-- Magic link sent state -->
		<div class="text-center">
			<div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
				<Mail class="size-7 text-primary" />
			</div>
			<h2 class="text-xl font-semibold text-foreground">Check your email</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				We sent a magic link to <strong class="text-foreground">{email}</strong>. Click the link to
				sign in.
			</p>
			<button
				onclick={() => (magicLinkSent = false)}
				class="mt-6 text-sm text-primary hover:underline"
			>
				Use a different email
			</button>
		</div>
	{:else}
		<div class="mb-6">
			<h2 class="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h2>
			<p class="mt-1 text-sm text-muted-foreground">Sign in to your EnSocial account</p>
		</div>

		<!-- Google sign in -->
		<Button variant="outline" class="w-full h-10" onclick={handleGoogleLogin}>
			<svg viewBox="0 0 24 24" class="size-4">
				<path
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					fill="#4285F4"
				/>
				<path
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					fill="#34A853"
				/>
				<path
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					fill="#FBBC05"
				/>
				<path
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					fill="#EA4335"
				/>
			</svg>
			Continue with Google
		</Button>

		<div class="my-5 flex items-center gap-3">
			<Separator />
			<span class="shrink-0 text-xs text-muted-foreground">or</span>
			<Separator />
		</div>

		<!-- Email + Password form -->
		<form onsubmit={handleEmailLogin} class="space-y-4">
			<div class="space-y-1.5">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@company.com"
					bind:value={email}
					autocomplete="email"
					required
				/>
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<Label for="password">Password</Label>
					<a href="/forgot-password" class="text-xs text-primary hover:underline">
						Forgot password?
					</a>
				</div>
				<div class="relative">
					<Input
						id="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="••••••••"
						bind:value={password}
						autocomplete="current-password"
						required
						class="pr-10"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					>
						{#if showPassword}
							<EyeOff class="size-4" />
						{:else}
							<Eye class="size-4" />
						{/if}
					</button>
				</div>
			</div>

			<Button type="submit" class="w-full" {loading}>
				Sign in
				{#if !loading}
					<ArrowRight class="size-4" />
				{/if}
			</Button>
		</form>

		<!-- Magic link -->
		<button
			onclick={handleMagicLink}
			class="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
			Send me a magic link instead
		</button>
	{/if}
</div>

<p class="mt-6 text-center text-sm text-muted-foreground">
	Don't have an account?
	<a href="/signup" class="font-medium text-primary hover:underline">Create one free</a>
</p>
