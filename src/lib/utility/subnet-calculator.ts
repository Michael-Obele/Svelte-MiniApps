/**
 * IPv4/IPv6 Subnet Calculator Utility Functions
 * Handles all CIDR notation calculations and conversions
 */

export interface IPv4SubnetInfo {
	isValid: boolean;
	ipAddress: string;
	networkAddress: string;
	broadcastAddress: string;
	firstUsableIp: string;
	lastUsableIp: string;
	subnetMask: string;
	wildcardMask: string;
	binarySubnetMask: string;
	totalHosts: number;
	usableHosts: number;
	ipClass: string;
	cidrNotation: string;
	error?: string;
}

export interface IPv6SubnetInfo {
	isValid: boolean;
	ipAddress: string;
	networkAddress: string;
	cidrNotation: string;
	totalAddresses: string;
	addressScope: string;
	binaryNotation: string;
	error?: string;
}

// IPv4 Utility Functions
function ipv4StringToOctets(ip: string): number[] | null {
	const parts = ip.trim().split('.');
	if (parts.length !== 4) return null;

	const octets = parts.map((p) => {
		const num = parseInt(p, 10);
		if (isNaN(num) || num < 0 || num > 255) return null;
		return num;
	});

	return octets.every((o) => o !== null) ? (octets as number[]) : null;
}

function octetsToIpv4String(octets: number[]): string {
	return octets.map((o) => Math.max(0, Math.min(255, o))).join('.');
}

function ipv4ToNumber(ip: string): number | null {
	const octets = ipv4StringToOctets(ip);
	if (!octets) return null;
	return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
}

function numberToIpv4(num: number): string {
	const octets = [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff];
	return octetsToIpv4String(octets);
}

function cidrToMask(cidr: number): number | null {
	if (cidr < 0 || cidr > 32 || !Number.isInteger(cidr)) return null;
	if (cidr === 0) return 0;
	return (0xffffffff << (32 - cidr)) >>> 0;
}

function maskToCidr(mask: number): number {
	let cidr = 0;
	let bits = mask >>> 0;

	for (let i = 0; i < 32; i++) {
		if ((bits & 0x80000000) === 0) break;
		cidr++;
		bits = (bits << 1) >>> 0;
	}

	return cidr;
}

function maskToIpv4String(mask: number): string {
	return numberToIpv4(mask);
}

function numberToBinary32(num: number): string {
	return ((num >>> 0).toString(2) as string).padStart(32, '0');
}

function formatBinaryWith8Dots(binary: string): string {
	return `${binary.substring(0, 8)}.${binary.substring(8, 16)}.${binary.substring(16, 24)}.${binary.substring(24, 32)}`;
}

function getIPv4Class(ip: string): string {
	const octets = ipv4StringToOctets(ip);
	if (!octets) return 'Invalid';

	const firstOctet = octets[0];
	if (firstOctet < 128) return 'A';
	if (firstOctet < 192) return 'B';
	if (firstOctet < 224) return 'C';
	if (firstOctet < 240) return 'D (Multicast)';
	return 'E (Reserved)';
}

function isPrivateIPv4(ip: string): boolean {
	const octets = ipv4StringToOctets(ip);
	if (!octets) return false;

	// 10.0.0.0/8
	if (octets[0] === 10) return true;
	// 172.16.0.0/12
	if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
	// 192.168.0.0/16
	if (octets[0] === 192 && octets[1] === 168) return true;
	// 127.0.0.0/8 (Loopback)
	if (octets[0] === 127) return true;

	return false;
}

export function calculateIPv4Subnet(ipAddress: string, cidrPrefix: number): IPv4SubnetInfo {
	// Validate CIDR
	if (!Number.isInteger(cidrPrefix) || cidrPrefix < 0 || cidrPrefix > 32) {
		return {
			isValid: false,
			ipAddress: ipAddress || '',
			networkAddress: '',
			broadcastAddress: '',
			firstUsableIp: '',
			lastUsableIp: '',
			subnetMask: '',
			wildcardMask: '',
			binarySubnetMask: '',
			totalHosts: 0,
			usableHosts: 0,
			ipClass: '',
			cidrNotation: '',
			error: `Invalid CIDR prefix: must be between 0 and 32`
		};
	}

	// Validate and convert IP
	const ipNum = ipv4ToNumber(ipAddress);
	if (ipNum === null) {
		return {
			isValid: false,
			ipAddress: ipAddress || '',
			networkAddress: '',
			broadcastAddress: '',
			firstUsableIp: '',
			lastUsableIp: '',
			subnetMask: '',
			wildcardMask: '',
			binarySubnetMask: '',
			totalHosts: 0,
			usableHosts: 0,
			ipClass: '',
			cidrNotation: '',
			error: 'Invalid IPv4 address format'
		};
	}

	// Calculate subnet mask
	const subnetMask = cidrToMask(cidrPrefix);
	if (subnetMask === null) {
		return {
			isValid: false,
			ipAddress,
			networkAddress: '',
			broadcastAddress: '',
			firstUsableIp: '',
			lastUsableIp: '',
			subnetMask: '',
			wildcardMask: '',
			binarySubnetMask: '',
			totalHosts: 0,
			usableHosts: 0,
			ipClass: '',
			cidrNotation: '',
			error: 'Invalid CIDR prefix'
		};
	}

	// Calculate network address
	const networkNum = ipNum & subnetMask;
	const networkAddress = numberToIpv4(networkNum);

	// Calculate broadcast address
	const wildcardMask = ~subnetMask >>> 0;
	const broadcastNum = networkNum | wildcardMask;
	const broadcastAddress = numberToIpv4(broadcastNum);

	// Calculate host counts
	const hostBits = 32 - cidrPrefix;
	const totalHosts = Math.pow(2, hostBits);

	let usableHosts = totalHosts;
	if (cidrPrefix < 31) {
		usableHosts = totalHosts - 2; // Exclude network and broadcast
	} else if (cidrPrefix === 31) {
		usableHosts = 2; // RFC 3021: both addresses usable for point-to-point
	} else {
		usableHosts = 1; // /32 is a single host
	}

	// Calculate first and last usable IPs
	let firstUsableIp = '';
	let lastUsableIp = '';

	if (cidrPrefix === 32) {
		firstUsableIp = networkAddress;
		lastUsableIp = networkAddress;
	} else if (cidrPrefix === 31) {
		firstUsableIp = networkAddress;
		lastUsableIp = broadcastAddress;
	} else {
		firstUsableIp = numberToIpv4(networkNum + 1);
		lastUsableIp = numberToIpv4(broadcastNum - 1);
	}

	return {
		isValid: true,
		ipAddress,
		networkAddress,
		broadcastAddress,
		firstUsableIp,
		lastUsableIp,
		subnetMask: maskToIpv4String(subnetMask),
		wildcardMask: maskToIpv4String(wildcardMask),
		binarySubnetMask: formatBinaryWith8Dots(numberToBinary32(subnetMask)),
		totalHosts: Math.floor(totalHosts),
		usableHosts: Math.floor(usableHosts),
		ipClass: getIPv4Class(networkAddress),
		cidrNotation: `${networkAddress}/${cidrPrefix}`,
		error: undefined
	};
}

// IPv6 Utility Functions
function validateIPv6(ip: string): boolean {
	// Simplified IPv6 validation - checks basic format
	const ipv6Regex =
		/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|::ffff:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|::|::1|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
	return ipv6Regex.test(ip.trim());
}

function getIPv6Scope(ip: string): string {
	const normalized = ip.toLowerCase();

	if (normalized === '::1') return 'Loopback';
	if (normalized.startsWith('fe80:')) return 'Link-local';
	if (normalized.startsWith('ff')) return 'Multicast';
	if (normalized.startsWith('::ffff:')) return 'IPv4-mapped';
	if (normalized.startsWith('2001:db8:')) return 'Documentation';
	if (normalized === '::') return 'Unspecified';

	return 'Global';
}

function ipv6ToBinary(ip: string): string {
	// Simplified: show basic structure
	const groups = ip.split(':');
	return groups
		.map((g) =>
			g
				? parseInt(g || '0', 16)
						.toString(2)
						.padStart(16, '0')
				: '0000000000000000'
		)
		.join(':');
}

export function calculateIPv6Subnet(ipAddress: string, cidrPrefix: number): IPv6SubnetInfo {
	// Validate CIDR
	if (!Number.isInteger(cidrPrefix) || cidrPrefix < 0 || cidrPrefix > 128) {
		return {
			isValid: false,
			ipAddress: ipAddress || '',
			networkAddress: '',
			cidrNotation: '',
			totalAddresses: '',
			addressScope: '',
			binaryNotation: '',
			error: `Invalid CIDR prefix: must be between 0 and 128`
		};
	}

	// Validate IPv6
	if (!validateIPv6(ipAddress)) {
		return {
			isValid: false,
			ipAddress: ipAddress || '',
			networkAddress: '',
			cidrNotation: '',
			totalAddresses: '',
			addressScope: '',
			binaryNotation: '',
			error: 'Invalid IPv6 address format'
		};
	}

	// Calculate network address (simplified - just show CIDR)
	const networkAddress = `${ipAddress}`;

	// Calculate total addresses: 2^(128 - prefix)
	const hostBits = 128 - cidrPrefix;
	const totalAddresses = hostBits <= 53 ? Math.pow(2, hostBits).toString() : `2^${hostBits}`;

	const scope = getIPv6Scope(ipAddress);
	const binary = ipv6ToBinary(ipAddress);

	return {
		isValid: true,
		ipAddress,
		networkAddress,
		cidrNotation: `${ipAddress}/${cidrPrefix}`,
		totalAddresses,
		addressScope: scope,
		binaryNotation: binary,
		error: undefined
	};
}

export function validateIPv4Address(ip: string): boolean {
	return ipv4ToNumber(ip) !== null;
}

export function validateIPv6Address(ip: string): boolean {
	return validateIPv6(ip);
}
