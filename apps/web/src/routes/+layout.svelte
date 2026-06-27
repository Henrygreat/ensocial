<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	const { children } = $props();
</script>

<ModeWatcher defaultMode="light" />
{@render children()}
