<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/ui/card";
	import MiniAppList from './MiniAppList.svelte';
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Your Projects</CardTitle>
			<CardDescription>Track your progress across all mini applications</CardDescription>
		</CardHeader>
		<CardContent>
			<MiniAppList />
		</CardContent>
	</Card>
</div>
