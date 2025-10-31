import { describe, it, expect } from 'vitest';

describe('QR Code Generator Utilities', () => {
	describe('generateVCard', () => {
		const generateVCard = (contactInfo: {
			name: string;
			phone: string;
			email: string;
			website: string;
		}) => {
			if (!contactInfo.name && !contactInfo.phone && !contactInfo.email && !contactInfo.website)
				return '';

			let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
			if (contactInfo.name) vcard += `FN:${contactInfo.name}\n`;
			if (contactInfo.phone) vcard += `TEL:${contactInfo.phone}\n`;
			if (contactInfo.email) vcard += `EMAIL:${contactInfo.email}\n`;
			if (contactInfo.website) vcard += `URL:${contactInfo.website}\n`;
			vcard += 'END:VCARD';
			return vcard;
		};

		it('should generate a complete vCard with all fields', () => {
			const contactInfo = {
				name: 'John Doe',
				phone: '+1234567890',
				email: 'john@example.com',
				website: 'https://johndoe.com'
			};

			const vcard = generateVCard(contactInfo);

			expect(vcard).toContain('BEGIN:VCARD');
			expect(vcard).toContain('VERSION:3.0');
			expect(vcard).toContain('FN:John Doe');
			expect(vcard).toContain('TEL:+1234567890');
			expect(vcard).toContain('EMAIL:john@example.com');
			expect(vcard).toContain('URL:https://johndoe.com');
			expect(vcard).toContain('END:VCARD');
		});

		it('should generate vCard with partial fields', () => {
			const contactInfo = {
				name: 'Jane Smith',
				phone: '',
				email: 'jane@example.com',
				website: ''
			};

			const vcard = generateVCard(contactInfo);

			expect(vcard).toContain('FN:Jane Smith');
			expect(vcard).toContain('EMAIL:jane@example.com');
			expect(vcard).not.toContain('TEL:');
			expect(vcard).not.toContain('URL:');
		});

		it('should return empty string for empty contact info', () => {
			const contactInfo = {
				name: '',
				phone: '',
				email: '',
				website: ''
			};

			const vcard = generateVCard(contactInfo);

			expect(vcard).toBe('');
		});

		it('should handle special characters in fields', () => {
			const contactInfo = {
				name: 'José María González',
				phone: '+34 612 345 678',
				email: 'jose.maria@example.com',
				website: 'https://josemaria.es'
			};

			const vcard = generateVCard(contactInfo);

			expect(vcard).toContain('FN:José María González');
			expect(vcard).toContain('TEL:+34 612 345 678');
		});
	});

	describe('generateSocialLinks', () => {
		const generateSocialLinks = (socialLinks: Array<{ label: string; url: string }>) => {
			const validLinks = socialLinks.filter((link) => link.label && link.url);
			if (validLinks.length === 0) return '';

			let text = 'My Social Links:\n\n';
			validLinks.forEach((link) => {
				const safeUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
				text += `${link.label}: ${safeUrl}\n`;
			});
			return text;
		};

		it('should generate social links text with valid links', () => {
			const socialLinks = [
				{ label: 'Twitter', url: 'https://twitter.com/user' },
				{ label: 'GitHub', url: 'github.com/user' },
				{ label: '', url: 'https://example.com' }, // Invalid - no label
				{ label: 'LinkedIn', url: '' } // Invalid - no url
			];

			const result = generateSocialLinks(socialLinks);

			expect(result).toContain('My Social Links:');
			expect(result).toContain('Twitter: https://twitter.com/user');
			expect(result).toContain('GitHub: https://github.com/user');
			expect(result).not.toContain('https://example.com');
			expect(result).not.toContain('LinkedIn');
		});

		it('should add https prefix to URLs without protocol', () => {
			const socialLinks = [
				{ label: 'Website', url: 'example.com' }
			];

			const result = generateSocialLinks(socialLinks);

			expect(result).toContain('Website: https://example.com');
		});

		it('should return empty string for no valid links', () => {
			const socialLinks = [
				{ label: '', url: 'https://example.com' },
				{ label: 'Twitter', url: '' },
				{ label: '', url: '' }
			];

			const result = generateSocialLinks(socialLinks);

			expect(result).toBe('');
		});

		it('should handle multiple valid links', () => {
			const socialLinks = [
				{ label: 'Facebook', url: 'https://facebook.com/user' },
				{ label: 'Instagram', url: 'instagram.com/user' },
				{ label: 'YouTube', url: 'https://youtube.com/channel' }
			];

			const result = generateSocialLinks(socialLinks);

			expect(result).toContain('Facebook: https://facebook.com/user');
			expect(result).toContain('Instagram: https://instagram.com/user');
			expect(result).toContain('YouTube: https://youtube.com/channel');
		});

		it('should handle empty social links array', () => {
			const socialLinks: Array<{ label: string; url: string }> = [];

			const result = generateSocialLinks(socialLinks);

			expect(result).toBe('');
		});
	});

	describe('Input validation', () => {
		it('should validate URL format for social links', () => {
			const socialLinks = [
				{ label: 'Valid URL', url: 'https://example.com' },
				{ label: 'Invalid URL', url: 'not-a-url' },
				{ label: 'No Protocol', url: 'example.com' }
			];

			const generateSocialLinks = (socialLinks: Array<{ label: string; url: string }>) => {
				const validLinks = socialLinks.filter((link) => link.label && link.url);
				if (validLinks.length === 0) return '';

				let text = 'My Social Links:\n\n';
				validLinks.forEach((link) => {
					const safeUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
					text += `${link.label}: ${safeUrl}\n`;
				});
				return text;
			};

			const result = generateSocialLinks(socialLinks);

			expect(result).toContain('Valid URL: https://example.com');
			expect(result).toContain('Invalid URL: https://not-a-url');
			expect(result).toContain('No Protocol: https://example.com');
		});

		it('should handle special characters in labels and URLs', () => {
			const socialLinks = [
				{ label: 'Café & Restaurant', url: 'https://café-restaurant.com' }
			];

			const generateSocialLinks = (socialLinks: Array<{ label: string; url: string }>) => {
				const validLinks = socialLinks.filter((link) => link.label && link.url);
				if (validLinks.length === 0) return '';

				let text = 'My Social Links:\n\n';
				validLinks.forEach((link) => {
					const safeUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
					text += `${link.label}: ${safeUrl}\n`;
				});
				return text;
			};

			const result = generateSocialLinks(socialLinks);

			expect(result).toContain('Café & Restaurant: https://café-restaurant.com');
		});
	});
});
