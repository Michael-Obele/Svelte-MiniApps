<script>
	import { AlertTriangle } from 'lucide-svelte';
</script>

<div class="beta-banner">
	<div class="icon">
		<AlertTriangle size={18} />
	</div>
	<p class="message">This app is in beta. Features may be unstable or incomplete.</p>
</div>

<style>
	.beta-banner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: rgb(var(--warning-50, 255 247 237));
		border: 1px solid rgb(var(--warning-200, 254 215 170));
		border-radius: 0.375rem;
		margin-bottom: 1rem;
		width: 100%;
	}

	.icon {
		display: flex;
		color: rgb(var(--warning-500, 249 115 22));
		flex-shrink: 0;
	}

	.message {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: rgb(var(--warning-700, 194 65 12));
	}

	@media (max-width: 640px) {
		.beta-banner {
			padding: 0.375rem 0.75rem;
		}
		
		.message {
			font-size: 0.75rem;
		}
	}
</style>
