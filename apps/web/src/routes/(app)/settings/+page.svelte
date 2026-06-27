<script lang="ts">
	import Card from '$components/ui/card.svelte';
	import Button from '$components/ui/button.svelte';
	import Input from '$components/ui/input.svelte';
	import Label from '$components/ui/label.svelte';
	import Separator from '$components/ui/separator.svelte';
	import Avatar from '$components/ui/avatar.svelte';
	import Badge from '$components/ui/badge.svelte';
	import { User, Building2, CreditCard, Shield, Bell, Palette } from 'lucide-svelte';

	let activeSection = $state('profile');

	const sections = [
		{ id: 'profile', icon: User, label: 'Profile' },
		{ id: 'organization', icon: Building2, label: 'Organization' },
		{ id: 'billing', icon: CreditCard, label: 'Billing' },
		{ id: 'notifications', icon: Bell, label: 'Notifications' },
		{ id: 'security', icon: Shield, label: 'Security' },
		{ id: 'appearance', icon: Palette, label: 'Appearance' }
	];

	let name = $state('Henry Great');
	let email = $state('oyaincrease@gmail.com');
	let orgName = $state('My Organization');
</script>

<svelte:head>
	<title>Settings — EnSocial</title>
</svelte:head>

<div class="mb-6">
	<h1 class="text-2xl font-semibold text-foreground">Settings</h1>
	<p class="text-sm text-muted-foreground mt-0.5">Manage your account and workspace preferences</p>
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
	<!-- Sidebar nav -->
	<div class="space-y-1">
		{#each sections as section}
			<button
				onclick={() => (activeSection = section.id)}
				class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left {activeSection === section.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
			>
				<svelte:component this={section.icon} class="size-4 shrink-0" />
				{section.label}
			</button>
		{/each}
	</div>

	<!-- Content -->
	<div class="lg:col-span-3">
		{#if activeSection === 'profile'}
			<Card class="p-6 space-y-6">
				<div>
					<h2 class="text-base font-semibold text-foreground">Profile</h2>
					<p class="text-sm text-muted-foreground mt-0.5">Update your personal information</p>
				</div>
				<Separator />
				<div class="flex items-center gap-4">
					<Avatar name={name} size="xl" />
					<div>
						<Button variant="outline" size="sm">Change photo</Button>
						<p class="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="name">Full name</Label>
						<Input id="name" bind:value={name} />
					</div>
					<div class="space-y-1.5">
						<Label for="email">Email</Label>
						<Input id="email" type="email" bind:value={email} />
					</div>
				</div>
				<Button>Save changes</Button>
			</Card>

		{:else if activeSection === 'billing'}
			<Card class="p-6">
				<div class="mb-6">
					<h2 class="text-base font-semibold text-foreground">Billing & Plan</h2>
					<p class="text-sm text-muted-foreground mt-0.5">Manage your subscription and billing</p>
				</div>
				<div class="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-semibold text-foreground">Free Plan</p>
							<p class="text-xs text-muted-foreground mt-0.5">3 social accounts · 10 scheduled posts · 50 AI credits/mo</p>
						</div>
						<Badge variant="secondary">Current</Badge>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{#each [
						{ name: 'Solo', price: '$19', desc: '10 accounts · Unlimited posts · 500 AI credits' },
						{ name: 'Pro', price: '$49', desc: '25 accounts · Unlimited · 2000 AI credits · Team' },
						{ name: 'Agency', price: '$149', desc: 'Unlimited · White-label · API access · Priority support' }
					] as plan}
						<div class="rounded-xl border border-border p-4 hover:border-primary transition-colors cursor-pointer">
							<p class="text-sm font-semibold text-foreground">{plan.name}</p>
							<p class="text-2xl font-bold text-foreground mt-1">{plan.price}<span class="text-sm font-normal text-muted-foreground">/mo</span></p>
							<p class="text-xs text-muted-foreground mt-2">{plan.desc}</p>
							<Button variant="outline" size="sm" class="mt-4 w-full">Upgrade</Button>
						</div>
					{/each}
				</div>
			</Card>

		{:else}
			<Card class="p-6">
				<h2 class="text-base font-semibold text-foreground capitalize">{activeSection}</h2>
				<p class="text-sm text-muted-foreground mt-1">This section is coming soon.</p>
			</Card>
		{/if}
	</div>
</div>
