import { Play, BookOpen, Zap, Network, AlertCircle, type Icon as IconType } from '@lucide/svelte';
import type { HowToUseConfig, Step, Feature, Tip } from '$lib/types/how-to-use';

// Getting Started Steps
const gettingStartedSteps: Step[] = [
	{
		number: 1,
		title: 'Select IP Version',
		description:
			'Toggle between <strong>IPv4</strong> and <strong>IPv6</strong> using the switch at the top.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 2,
		title: 'Enter IP Address',
		description:
			'Input your IP address (e.g., <code>192.168.1.5</code> for IPv4 or <code>2001:db8::1</code> for IPv6).',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 3,
		title: 'Enter CIDR Prefix',
		description:
			'Provide the CIDR prefix (e.g., <code>/24</code> for IPv4 or <code>/64</code> for IPv6).',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 4,
		title: 'View Results',
		description:
			'The calculator instantly shows subnet information including network address, broadcast address, and usable host range.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	},
	{
		number: 5,
		title: 'Customize Display',
		description:
			'Use checkboxes below to toggle detailed information sections like binary representation and IP class.',
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
	}
];

// IPv4 Features
const ipv4Features: Feature[] = [
	{
		icon: BookOpen,
		title: 'CIDR Notation',
		description:
			'CIDR (Classless Inter-Domain Routing) uses a slash followed by bits (e.g., /24). The number represents network bits out of 32 total.'
	},
	{
		icon: Network,
		title: 'Subnet Masks',
		description:
			'A subnet mask (e.g., 255.255.255.0) determines which part of the IP is the network and which is for hosts.'
	},
	{
		icon: Zap,
		title: 'Network & Broadcast',
		description:
			'First address is network (all host bits = 0), last is broadcast (all host bits = 1). Neither can be assigned to devices.'
	},
	{
		icon: AlertCircle,
		title: 'IP Classes',
		description:
			'Traditional classes: A (0-127), B (128-191), C (192-223), D (224-239), E (240-255). Modern networks use CIDR instead.'
	}
];

// IPv6 Features
const ipv6Features: Feature[] = [
	{
		icon: BookOpen,
		title: '128-Bit Addresses',
		description:
			'IPv6 uses 128 bits vs IPv4s 32 bits, allowing for vastly more addresses. CIDR values range from 0 to 128.'
	},
	{
		icon: Network,
		title: 'Default Subnet',
		description:
			'The standard IPv6 LAN subnet is /64, which allows for stateless auto-configuration of devices.'
	},
	{
		icon: Zap,
		title: 'No Broadcast',
		description:
			'IPv6 eliminates broadcast addresses entirely, using multicast instead for one-to-many communication.'
	},
	{
		icon: AlertCircle,
		title: 'Address Scope',
		description:
			'IPv6 addresses have scopes: Loopback, Link-Local (FE80::/10), Unique-Local (FC00::/7), and Global Unicast.'
	}
];

// Quick Tips
const quickTips: Tip[] = [
	{
		text: 'Private IPv4 ranges: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>'
	},
	{
		text: 'Common subnets: <code>/24</code> for small networks, <code>/23</code> or <code>/22</code> for larger deployments'
	},
	{ text: '<code>/32</code> = single host; <code>/31</code> = point-to-point link (RFC 3021)' },
	{ text: 'Smaller CIDR numbers = larger networks; larger numbers = smaller networks' },
	{ text: 'Use binary representation to visualize network vs host bit boundaries' }
];

// Wildcard & Advanced
const wildcardFeatures: Feature[] = [
	{
		icon: BookOpen,
		title: 'Wildcard Mask',
		description:
			'The inverse of subnet mask, used in ACLs. Where subnet mask has 1s, wildcard has 0s, and vice versa.'
	},
	{
		icon: Zap,
		title: 'Host Count Formula',
		description:
			'IPv4: 2<sup>(32-prefix)</sup> - 2 total addresses. Exception: /31 and /32 have special rules.'
	},
	{
		icon: Network,
		title: 'Binary Representation',
		description:
			'View the actual binary form of subnet masks to understand network boundaries at the bit level.'
	}
];

export const subnetCalculatorHowToUse: HowToUseConfig = {
	title: 'Subnet Calculator Guide',
	description: 'Calculate IPv4 and IPv6 subnets with CIDR notation',
	storageKey: 'subnet-calculator-has-seen-guide',
	showFooterHelpText: false,
	tabs: [
		{
			value: 'start',
			label: 'Start',
			icon: Play,
			steps: gettingStartedSteps,
			proTip: {
				text: 'Start with common ranges like <code>192.168.1.0/24</code> for IPv4 or <code>2001:db8::/64</code> for IPv6 to learn quickly!'
			}
		},
		{
			value: 'ipv4',
			label: 'IPv4',
			icon: Network,
			features: ipv4Features,
			optionalDetails: [
				{
					label: 'Usable Hosts',
					description: 'Total addresses minus network and broadcast addresses (except /31 and /32)'
				},
				{
					label: 'Decimal to Binary',
					description: 'Subnet mask shown in both decimal and binary formats'
				}
			]
		},
		{
			value: 'ipv6',
			label: 'IPv6',
			icon: Zap,
			features: ipv6Features,
			optionalDetails: [
				{
					label: 'Address Scope',
					description: 'Identifies if address is Link-Local, Unique-Local, or Global Unicast'
				},
				{
					label: 'No Broadcast',
					description: 'IPv6 uses multicast (FF00::/8) instead of broadcast (255.255.255.255)'
				}
			]
		},
		{
			value: 'advanced',
			label: 'Advanced',
			icon: BookOpen,
			features: wildcardFeatures,
			tips: quickTips
		}
	]
};
