<script lang="ts">
	import { site } from '$lib/index.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Switch } from '@/ui/switch';
	import { Checkbox } from '@/ui/checkbox';
	import { Button } from '@/ui/button';
	import { Badge } from '@/ui/badge';
	import { AlertCircle, Copy, Network, Binary, Code, Info } from 'lucide-svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { subnetCalculatorHowToUse } from './how-to-use-config';
	import { toast } from 'svelte-sonner';
	import {
		calculateIPv4Subnet,
		calculateIPv6Subnet,
		validateIPv4Address,
		validateIPv6Address,
		type IPv4SubnetInfo,
		type IPv6SubnetInfo
	} from '$lib/utility/subnet-calculator';

	let isIPv6 = $state(false);
	let ipInput = $state('192.168.1.5');
	let cidrInput = $state(24);
	let showHowToUse = $state(false);

	// Visibility toggles
	let showBasicInfo = $state(true);
	let showSubnetMask = $state(true);
	let showBinaryRepresentation = $state(true);
	let showIPClass = $state(true);
	let showWildcardMask = $state(true);
	let showAddressRanges = $state(true);
	let showHostCounts = $state(true);
	let showAddressScope = $state(false); // IPv6 specific

	// Computed subnet information
	let subnetInfo = $derived.by(() => {
		if (isIPv6) {
			return calculateIPv6Subnet(ipInput || '', cidrInput);
		} else {
			return calculateIPv4Subnet(ipInput || '', cidrInput);
		}
	});

	// Check if input is valid
	let isInputValid = $derived(subnetInfo.isValid);

	function copyToClipboard(text: string, label: string) {
		navigator.clipboard.writeText(text).then(() => {
			toast.success(`Copied: ${label}`);
		});
	}

	function copyAllResults() {
		let output = '';

		if (!isIPv6) {
			const info = subnetInfo as IPv4SubnetInfo;
			output = `Subnet Calculator Results - IPv4

IP Address: ${info.ipAddress}
Network Address: ${info.networkAddress}
CIDR Notation: ${info.cidrNotation}
Subnet Mask: ${info.subnetMask}
Wildcard Mask: ${info.wildcardMask}
Binary Subnet Mask: ${info.binarySubnetMask}

Address Range:
- Usable Host IP Range: ${info.firstUsableIp} - ${info.lastUsableIp}
- Broadcast Address: ${info.broadcastAddress}

Host Counts:
- Total Number of Hosts: ${info.totalHosts}
- Number of Usable Hosts: ${info.usableHosts}

IP Class: ${info.ipClass}`;
		} else {
			const info = subnetInfo as IPv6SubnetInfo;
			output = `Subnet Calculator Results - IPv6

IP Address: ${info.ipAddress}
Network Address: ${info.networkAddress}
CIDR Notation: ${info.cidrNotation}
Total Addresses: ${info.totalAddresses}
Address Scope: ${info.addressScope}`;
		}

		navigator.clipboard.writeText(output).then(() => {
			toast.success('All results copied to clipboard');
		});
	}

	function swapIPv4IPv6() {
		isIPv6 = !isIPv6;
		// Reset to sensible defaults for the other version
		if (isIPv6) {
			ipInput = '2001:db8::1';
			cidrInput = 64;
		} else {
			ipInput = '192.168.1.5';
			cidrInput = 24;
		}
	}
</script>

<RouteHead
	title="Subnet Calculator - IPv4 & IPv6 - Svelte Mini Apps"
	description="Real-time IPv4 and IPv6 subnet calculator with CIDR notation. Calculate network addresses, broadcast addresses, subnet masks, and usable IP ranges instantly."
/>

<div class="container mx-auto max-w-6xl p-4">
	<!-- Header with Gradient Background -->
	<div class="mb-10">
		<div
			class="from-primary/10 via-primary/5 border-primary/10 rounded-2xl border bg-gradient-to-br to-transparent p-8"
		>
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="flex items-center gap-4">
					<div class="bg-primary/10 rounded-lg p-3">
						<Network class="text-primary h-8 w-8" />
					</div>
					<div>
						<h1 class="text-3xl font-bold tracking-tight md:text-4xl">Subnet Calculator</h1>
						<p class="text-muted-foreground mt-1 text-sm">IPv4 & IPv6 subnetting with CIDR</p>
					</div>
				</div>
				<Button variant="outline" size="lg" onclick={() => (showHowToUse = true)} class="shrink-0">
					<Info class="mr-2 h-4 w-4" />
					How to Use
				</Button>
			</div>
		</div>
	</div>

	<!-- How To Use Dialog -->
	<HowToUseDialog
		bind:open={showHowToUse}
		title={subnetCalculatorHowToUse.title}
		description={subnetCalculatorHowToUse.description}
		tabs={subnetCalculatorHowToUse.tabs}
	/>

	<!-- Mode Toggle and Input Section -->
	<Card class="mb-8 border-0 shadow-lg">
		<CardHeader class="from-background to-primary/5 border-b bg-gradient-to-r">
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<CardTitle>Subnet Configuration</CardTitle>
					<CardDescription>Select IP version and enter address with CIDR</CardDescription>
				</div>
				<div class="bg-background/50 flex items-center gap-4 rounded-lg border p-2">
					<span
						class={`rounded px-2 py-1 text-xs font-bold transition-colors ${!isIPv6 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
					>
						IPv4
					</span>
					<Switch
						checked={isIPv6}
						onchange={swapIPv4IPv6}
						aria-label="Toggle between IPv4 and IPv6"
					/>
					<span
						class={`rounded px-2 py-1 text-xs font-bold transition-colors ${isIPv6 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
					>
						IPv6
					</span>
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-6 pt-6">
			<div class="grid gap-6 md:grid-cols-2">
				<!-- IP Address Input -->
				<div class="space-y-3">
					<Label for="ip-input" class="text-sm font-semibold">
						{isIPv6 ? 'IPv6 Address' : 'IPv4 Address'}
					</Label>
					<Input
						id="ip-input"
						bind:value={ipInput}
						placeholder={isIPv6 ? '2001:db8::1' : '192.168.1.0'}
						class="h-10 font-mono text-base"
					/>
					<p class="text-muted-foreground text-xs">
						{isIPv6 ? 'e.g., 2001:db8::1 or fe80::1' : 'e.g., 192.168.1.0 or 10.0.0.0'}
					</p>
				</div>

				<!-- CIDR Input -->
				<div class="space-y-3">
					<Label for="cidr-input" class="text-sm font-semibold">CIDR Prefix</Label>
					<div class="flex gap-3">
						<Input
							id="cidr-input"
							type="number"
							bind:value={cidrInput}
							min={0}
							max={isIPv6 ? 128 : 32}
							placeholder={isIPv6 ? '64' : '24'}
							class="h-10 flex-1 font-mono text-base"
						/>
						<div
							class="border-input bg-muted flex items-center rounded-md border px-4 font-mono text-base font-semibold"
						>
							/{cidrInput}
						</div>
					</div>
					<p class="text-muted-foreground text-xs">
						{isIPv6 ? 'Default LAN subnet is /64' : 'Common values: /8, /16, /24, /30'}
					</p>
				</div>
			</div>

			<!-- Error Display -->
			{#if !isInputValid && subnetInfo.error}
				<div
					class="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
				>
					<AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
					<p class="text-sm text-red-600 dark:text-red-400">{subnetInfo.error}</p>
				</div>
			{/if}
		</CardContent>
	</Card>

	{#if isInputValid}
		<!-- Main Results Card -->
		<Card class="border-primary/20 from-background to-primary/5 mb-8 border-2 bg-gradient-to-br">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Code class="h-5 w-5" />
					Essential Information
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					{#if !isIPv6}
						{@const info = subnetInfo as IPv4SubnetInfo}
						<!-- IPv4 Key Info -->
						<div class="space-y-3">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">IP Address</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.ipAddress}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.ipAddress, 'IP Address')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground text-xs font-semibold">Network Address</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.networkAddress}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.networkAddress, 'Network Address')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground text-xs font-semibold">CIDR Notation</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.cidrNotation}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.cidrNotation, 'CIDR Notation')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>

						<div class="space-y-3">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Subnet Mask</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.subnetMask}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.subnetMask, 'Subnet Mask')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground text-xs font-semibold">Broadcast Address</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.broadcastAddress}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.broadcastAddress, 'Broadcast Address')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground text-xs font-semibold">Usable Host Range</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.firstUsableIp} - {info.lastUsableIp}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() =>
											copyToClipboard(`${info.firstUsableIp} - ${info.lastUsableIp}`, 'Host Range')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					{:else}
						{@const info = subnetInfo as IPv6SubnetInfo}
						<!-- IPv6 Key Info -->
						<div class="space-y-3">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">IPv6 Address</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold break-all">{info.ipAddress}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.ipAddress, 'IPv6 Address')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground text-xs font-semibold">Network Address</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold break-all">{info.networkAddress}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.networkAddress, 'Network Address')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground text-xs font-semibold">CIDR Notation</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.cidrNotation}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.cidrNotation, 'CIDR Notation')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>

						<div class="space-y-3">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Total Addresses</p>
								<div class="flex items-center justify-between">
									<code class="text-lg font-bold">{info.totalAddresses}</code>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.totalAddresses, 'Total Addresses')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground text-xs font-semibold">Address Scope</p>
								<div class="flex items-center justify-between">
									<Badge variant="outline">{info.addressScope}</Badge>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard(info.addressScope, 'Address Scope')}
									>
										<Copy class="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Copy All Button -->
				<Button onclick={copyAllResults} class="mt-6 w-full">
					<Copy class="mr-2 h-4 w-4" />
					Copy All Results
				</Button>
			</CardContent>
		</Card>

		<!-- Information Toggle Section -->
		<Card class="mb-8">
			<CardHeader>
				<CardTitle>Display Options</CardTitle>
				<CardDescription>Select which information sections to display</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
					<div class="flex items-center space-x-2">
						<Checkbox id="show-basic" bind:checked={showBasicInfo} />
						<label
							for="show-basic"
							class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Basic Information
						</label>
					</div>

					<div class="flex items-center space-x-2">
						<Checkbox id="show-subnet" bind:checked={showSubnetMask} />
						<label
							for="show-subnet"
							class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Subnet Mask Details
						</label>
					</div>

					<div class="flex items-center space-x-2">
						<Checkbox id="show-binary" bind:checked={showBinaryRepresentation} />
						<label
							for="show-binary"
							class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Binary Representation
						</label>
					</div>

					{#if !isIPv6}
						<div class="flex items-center space-x-2">
							<Checkbox id="show-class" bind:checked={showIPClass} />
							<label
								for="show-class"
								class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								IP Class
							</label>
						</div>

						<div class="flex items-center space-x-2">
							<Checkbox id="show-wildcard" bind:checked={showWildcardMask} />
							<label
								for="show-wildcard"
								class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Wildcard Mask
							</label>
						</div>

						<div class="flex items-center space-x-2">
							<Checkbox id="show-ranges" bind:checked={showAddressRanges} />
							<label
								for="show-ranges"
								class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Address Ranges
							</label>
						</div>
					{:else}
						<div class="flex items-center space-x-2">
							<Checkbox id="show-scope" bind:checked={showAddressScope} />
							<label
								for="show-scope"
								class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Address Scope
							</label>
						</div>
					{/if}

					<div class="flex items-center space-x-2">
						<Checkbox id="show-hosts" bind:checked={showHostCounts} />
						<label
							for="show-hosts"
							class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Host Counts
						</label>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Detailed Information Cards -->
		<div class="grid gap-8 md:grid-cols-2">
			{#if !isIPv6}
				{@const info = subnetInfo as IPv4SubnetInfo}

				<!-- Address Ranges Card -->
				{#if showAddressRanges}
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Address Ranges</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Network Address</p>
								<code class="bg-muted block rounded p-2 font-mono text-sm"
									>{info.networkAddress}</code
								>
							</div>
							<div>
								<p class="text-muted-foreground text-xs font-semibold">First Usable IP</p>
								<code class="bg-muted block rounded p-2 font-mono text-sm"
									>{info.firstUsableIp}</code
								>
							</div>
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Last Usable IP</p>
								<code class="bg-muted block rounded p-2 font-mono text-sm">{info.lastUsableIp}</code
								>
							</div>
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Broadcast Address</p>
								<code class="bg-muted block rounded p-2 font-mono text-sm"
									>{info.broadcastAddress}</code
								>
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Subnet Mask Details Card -->
				{#if showSubnetMask}
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Subnet Mask Details</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">
									Subnet Mask (Dotted Decimal)
								</p>
								<code class="bg-muted block rounded p-2 font-mono text-sm">{info.subnetMask}</code>
							</div>
							<div>
								<p class="text-muted-foreground text-xs font-semibold">CIDR Notation</p>
								<code class="bg-muted block rounded p-2 font-mono text-sm"
									>/{32 -
										Math.log2(
											Math.pow(
												2,
												32 - (32 - Math.log2(65536 - (info.totalHosts - info.usableHosts - 2)))
											)
										)}</code
								>
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Host Counts Card -->
				{#if showHostCounts}
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Host Counts</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Total Addresses</p>
								<p class="text-2xl font-bold">{info.totalHosts.toLocaleString()}</p>
							</div>
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Usable Host Addresses</p>
								<p class="text-2xl font-bold text-green-600 dark:text-green-400">
									{info.usableHosts.toLocaleString()}
								</p>
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Wildcard Mask Card -->
				{#if showWildcardMask}
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Wildcard Mask</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">
									Wildcard Mask (Dotted Decimal)
								</p>
								<code class="bg-muted block rounded p-2 font-mono text-sm">{info.wildcardMask}</code
								>
							</div>
							<p class="text-muted-foreground text-xs">
								Used in ACLs and OSPF configurations (inverse of subnet mask)
							</p>
						</CardContent>
					</Card>
				{/if}

				<!-- IP Class Card -->
				{#if showIPClass}
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">IP Classification</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Class</p>
								<Badge variant="secondary">{info.ipClass}</Badge>
							</div>
							<div>
								<p class="text-muted-foreground text-xs font-semibold">Scope</p>
								<Badge variant="outline">
									{info.ipAddress.startsWith('10.') ||
									info.ipAddress.startsWith('172.') ||
									info.ipAddress.startsWith('192.168.')
										? 'Private'
										: 'Public'}
								</Badge>
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Binary Representation Card -->
				{#if showBinaryRepresentation}
					<Card class="md:col-span-2">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-lg">
								<Binary class="h-5 w-5" />
								Binary Subnet Mask
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<p class="text-muted-foreground text-xs font-semibold">
									Network Bits (1) | Host Bits (0)
								</p>
								<code class="bg-muted block overflow-x-auto rounded p-3 font-mono text-sm"
									>{info.binarySubnetMask}</code
								>
							</div>
							<p class="text-muted-foreground text-xs">
								First {32 - (info.totalHosts === 1 ? 0 : Math.log2(info.totalHosts))} bits are network
								portion, remaining {Math.log2(info.totalHosts)} bits are host portion.
							</p>
						</CardContent>
					</Card>
				{/if}
			{:else}
				{@const info = subnetInfo as IPv6SubnetInfo}

				<!-- IPv6 Binary Card -->
				{#if showBinaryRepresentation}
					<Card class="md:col-span-2">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-lg">
								<Binary class="h-5 w-4" />
								Binary Representation
							</CardTitle>
						</CardHeader>
						<CardContent>
							<code class="bg-muted block overflow-x-auto rounded p-3 font-mono text-xs break-all">
								{info.binaryNotation}
							</code>
						</CardContent>
					</Card>
				{/if}

				<!-- IPv6 Scope Card -->
				{#if showAddressScope}
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Address Scope</CardTitle>
						</CardHeader>
						<CardContent>
							<Badge variant="secondary" class="px-3 py-1 text-base">{info.addressScope}</Badge>
						</CardContent>
					</Card>
				{/if}
			{/if}
		</div>
	{/if}
</div>
