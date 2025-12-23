<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';

	let { computed, year } = $props<{
		computed: any;
		year: string;
	}>();
</script>

<div class="space-y-4">
	<Card>
		<CardHeader>
			<CardTitle>Top Contributed Repositories</CardTitle>
			<CardDescription>Most starred repositories you contributed to in {year}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each computed.topRepositories as repo (repo.url)}
					<a
						href={repo.url}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:bg-accent block rounded-lg border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
					>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<h3 class="font-semibold">{repo.nameWithOwner}</h3>
								{#if repo.description}
									<p class="text-muted-foreground mt-1 text-sm">{repo.description}</p>
								{/if}
								<div class="mt-2 flex items-center gap-4 text-sm">
									{#if repo.primaryLanguage}
										<span class="flex items-center gap-1">
											<span
												class="h-3 w-3 rounded-full"
												style="background-color: {repo.primaryLanguage.color}"
											></span>
											{repo.primaryLanguage.name}
										</span>
									{/if}
									<span>⭐ {repo.stargazerCount.toLocaleString()}</span>
									<span>🍴 {repo.forkCount.toLocaleString()}</span>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
