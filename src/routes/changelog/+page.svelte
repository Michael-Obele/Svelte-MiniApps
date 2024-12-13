<script>
	import BlurInText from '$lib/components/blocks/BlurInText.svelte';
	import { Motion } from 'svelte-motion';
	import { items, timeline, updates } from './data';
</script>

<div class="min-h-screen bg-gradient-to-b from-background to-background/95">
	<div class="container mx-auto px-4 py-16">
		<div class="relative mb-16">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-white/10"></div>
			</div>
			<div class="relative flex justify-center">
				<span
					class="bg-background px-4 text-sm font-semibold uppercase tracking-wider text-white/60"
				>
					Latest Updates
				</span>
			</div>
		</div>

		<BlurInText>
			<h1
				class="mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text py-6 text-center text-4xl font-bold text-transparent sm:text-5xl"
			>
				Changelog: Svelte 4 to Svelte 5
			</h1>
		</BlurInText>

		<p class="mx-auto mb-16 mt-6 max-w-2xl text-center text-lg text-white/60">
			Transforming into a powerful offline-first platform while upgrading to the latest Svelte
			technologies
		</p>

		<!-- Bento Grid -->
		<div class="mx-auto mb-16 grid max-w-5xl gap-4 px-4 md:auto-rows-[20rem] md:grid-cols-3">
			{#each items as item}
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div
						class={`group relative overflow-hidden rounded-xl bg-white/5 p-8 hover:bg-white/10 ${item.className}`}
					>
						<div class="relative z-10">
							<div class="mb-4 text-3xl">{item.icon}</div>
							<h3 class="mb-2 text-xl font-semibold text-white">{item.title}</h3>
							<p class="text-white/60">{item.description}</p>
						</div>
						<div
							class={`absolute inset-0 z-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
						></div>
					</div>
				</Motion>
			{/each}
		</div>

		<!-- Timeline -->
		<div class="container mx-auto w-full">
			<h2 class="mb-12 text-center text-3xl font-bold sm:text-4xl">
				<span class="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
					>Development Timeline</span
				>
			</h2>

			<!-- Desktop Timeline (hidden on mobile) -->
			<div class="relative hidden md:block">
				<div class="relative h-full overflow-hidden p-10">
					<!-- Center Line with Gradient -->
					<div
						class="absolute left-1/2 h-full w-[2px] bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-green-500/20"
						style="transform: translateX(-50%);"
					></div>

					{#each timeline as item, i}
						<Motion
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: i * 0.15 }}
						>
							<!-- Timeline Entry -->
							<div
								class="mb-16 flex w-full items-center justify-between {i % 2 === 0
									? ''
									: 'flex-row-reverse'}"
							>
								<div class="order-1 w-5/12"></div>

								<!-- Timeline Node -->
								<div
									class="z-20 order-1 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-background/80 shadow-xl ring-2 ring-white/10 backdrop-blur-sm"
								>
									<div class="absolute inset-0 bg-gradient-to-br {item.color} opacity-30"></div>
									<span class="relative z-10 text-xl">{item.icon}</span>
								</div>

								<!-- Content Card -->
								<div class="order-1 w-5/12">
									<div
										class="group relative overflow-hidden rounded-xl border border-white/10 bg-background/50 p-6 shadow-xl backdrop-blur-sm transition-all duration-300"
									>
										<div class="absolute inset-0 bg-gradient-to-br {item.color} opacity-5"></div>
										<div class="relative">
											<h3 class="mb-3 text-xl font-bold text-white">
												<span class="bg-gradient-to-r {item.color} bg-clip-text text-transparent"
													>{item.title}</span
												>
											</h3>

											<!-- Date Badge -->
											<div
												class="mb-3 inline-block rounded-full bg-gradient-to-r from-background/80 to-background px-3 py-1 text-sm font-medium text-white/80 ring-1 ring-white/10"
											>
												{item.date}
											</div>

											<!-- Description -->
											<p class="mb-4 text-sm leading-relaxed tracking-wide text-white/70">
												{item.description}
											</p>

											<!-- Feature List -->
											<ul class="space-y-2">
												{#each item.items as bullet}
													<li class="flex items-start gap-2 text-sm text-white/60">
														<span
															class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br {item.color}"
														></span>
														{bullet}
													</li>
												{/each}
											</ul>

											<!-- Hover Effect -->
											<div
												class="absolute inset-0 -z-10 bg-gradient-to-br {item.color} opacity-0 transition-all duration-500"
											></div>
										</div>
									</div>
								</div>
							</div>
						</Motion>
					{/each}
				</div>
			</div>

			<!-- Mobile Timeline (hidden on desktop) -->
			<div class="relative block px-4 md:hidden">
				<!-- Vertical Line with Gradient -->
				<div
					class="absolute left-3 top-0 h-full w-[2px] bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-green-500/20"
				></div>

				{#each timeline as item, i}
					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: i * 0.15 }}
					>
						<!-- Timeline Entry -->
						<div class="mb-8 ml-8">
							<!-- Timeline Node -->
							<div
								class="absolute -left-[8px] z-20 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-background/80 shadow-xl ring-2 ring-white/10 backdrop-blur-sm"
							>
								<div class="absolute inset-0 bg-gradient-to-br {item.color} opacity-30"></div>
								<span class="relative z-10 text-base">{item.icon}</span>
							</div>

							<!-- Content Card -->
							<div
								class="group relative overflow-hidden rounded-xl border border-white/10 bg-background/50 p-4 shadow-xl backdrop-blur-sm transition-all duration-300"
							>
								<div class="absolute inset-0 bg-gradient-to-br {item.color} opacity-5"></div>
								<div class="relative">
									<h3 class="mb-2 text-lg font-bold text-white">
										<span class="bg-gradient-to-r {item.color} bg-clip-text text-transparent"
											>{item.title}</span
										>
									</h3>

									<!-- Date Badge -->
									<div
										class="mb-2 inline-block rounded-full bg-gradient-to-r from-background/80 to-background px-2 py-1 text-xs font-medium text-white/80 ring-1 ring-white/10"
									>
										{item.date}
									</div>

									<!-- Description -->
									<p class="mb-3 text-xs leading-relaxed tracking-wide text-white/70">
										{item.description}
									</p>

									<!-- Feature List -->
									<ul class="space-y-1.5">
										{#each item.items as bullet}
											<li class="flex items-start gap-2 text-xs text-white/60">
												<span
													class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br {item.color}"
												></span>
												{bullet}
											</li>
										{/each}
									</ul>

									<!-- Hover Effect -->
									<div
										class="absolute inset-0 -z-10 bg-gradient-to-br {item.color} opacity-0 transition-all duration-500"
									></div>
								</div>
							</div>
						</div>
					</Motion>
				{/each}
			</div>
		</div>

		<!-- Detailed Updates -->
		<div class="mx-auto mt-24 max-w-3xl space-y-8">
			{#each updates as section}
				<div class="rounded-xl bg-white/5 p-8 backdrop-blur-sm">
					<h2 class="mb-6 text-2xl font-semibold text-white">{section.category}</h2>
					<ul class="list-disc space-y-4 pl-6 text-white/80">
						{#each section.items as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<section class="container mx-auto mt-16 max-w-3xl px-4 py-8 text-center">
			<p>
				For those who wish to use the SV4 version of the app, you can access it at <a
					href="https://old.svelte-apps.me"
					class="text-blue-500 underline">old.svelte-apps.me</a
				>
				or
				<a href="https://sv4.svelte-apps.me" class="text-blue-500 underline">sv4.svelte-apps.me</a>.
			</p>
		</section>

		<div class="mt-16 text-center">
			<p class="text-sm text-white/40">
				Last updated: {new Date().toLocaleDateString()}
			</p>
		</div>
	</div>
</div>
