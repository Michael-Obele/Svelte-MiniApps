<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { BookOpen } from "lucide-svelte";
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Learning Resources</CardTitle>
			<CardDescription>Svelte and SvelteKit documentation and tutorials</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="flex items-start gap-4 border-b pb-4">
					<div class="rounded-full bg-primary/10 p-2">
						<BookOpen class="h-4 w-4 text-primary" />
					</div>
					<div>
						<p class="font-medium">Svelte 5 Documentation</p>
						<p class="mb-2 text-sm text-muted-foreground">Learn about Svelte's reactive state management and component model</p>
						<Badge variant="outline">Recommended</Badge>
					</div>
				</div>
				<div class="flex items-start gap-4 border-b pb-4">
					<div class="rounded-full bg-primary/10 p-2">
						<BookOpen class="h-4 w-4 text-primary" />
					</div>
					<div>
						<p class="font-medium">SvelteKit Routing</p>
						<p class="mb-2 text-sm text-muted-foreground">Master file-based routing and server-side rendering</p>
						<Badge variant="outline">Intermediate</Badge>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="rounded-full bg-primary/10 p-2">
						<BookOpen class="h-4 w-4 text-primary" />
					</div>
					<div>
						<p class="font-medium">Tailwind CSS with Svelte</p>
						<p class="mb-2 text-sm text-muted-foreground">Build beautiful UIs with utility-first CSS</p>
						<Badge variant="outline">Beginner</Badge>
					</div>
				</div>
			</div>
		</CardContent>
		<CardFooter>
			<Button variant="outline" class="w-full">View All Resources</Button>
		</CardFooter>
	</Card>
</div>
