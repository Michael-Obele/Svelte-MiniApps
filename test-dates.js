// Test date parsing function
function parseDate(dateString) {
	// Handle date ranges like 'March 22-27, 2025' by using the end date
	if (dateString.includes('-')) {
		// Extract the end date from ranges like 'March 22-27, 2025' or 'November 29-30, 2024'
		const parts = dateString.split('-');
		if (parts.length === 2) {
			const [start, endPart] = parts;
			// Check if it's a range within the same month
			if (/^\d+,\s*\d{4}$/.test(endPart.trim())) {
				// Format: 'March 22-27, 2025' -> use 'March 27, 2025'
				const monthMatch = start.match(/^(.+?)\s+\d+$/);
				if (monthMatch) {
					const month = monthMatch[1];
					const endDate = `${month} ${endPart.trim()}`;
					const parsed = new Date(endDate);
					if (!isNaN(parsed.getTime())) {
						return parsed;
					}
				}
			} else {
				// Format: 'November 29-30, 2024' -> extract year and use end date
				const yearMatch = dateString.match(/(\d{4})$/);
				const endDayMatch = endPart.match(/(\d+)/);
				const monthMatch = start.match(/^(.+?)\s+\d+$/);

				if (yearMatch && endDayMatch && monthMatch) {
					const year = yearMatch[1];
					const endDay = endDayMatch[1];
					const month = monthMatch[1];
					const endDate = `${month} ${endDay}, ${year}`;
					const parsed = new Date(endDate);
					if (!isNaN(parsed.getTime())) {
						return parsed;
					}
				}
			}
		}
	}

	// Handle standard 'Month DD, YYYY' format
	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		console.warn(`Failed to parse date: ${dateString}`);
		return new Date();
	}
	return date;
}

const testDates = [
	'August 26, 2025',
	'March 29, 2025',
	'March 22-27, 2025',
	'November 29-30, 2024',
	'December 22-25, 2024'
];

console.log('Date parsing test:');
testDates.forEach((d) => {
	const parsed = parseDate(d);
	console.log(`'${d}' -> ${parsed.toISOString().split('T')[0]} (${parsed.getTime()})`);
});

console.log('\nSorted:');
const sorted = testDates.sort((a, b) => parseDate(b).getTime() - parseDate(a).getTime());
sorted.forEach((d, i) => console.log(`${i + 1}. ${d}`));
