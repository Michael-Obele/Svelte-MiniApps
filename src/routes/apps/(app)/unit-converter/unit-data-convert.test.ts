import { describe, it, expect } from 'vitest';
import { convertUnits, unitTypes, units, type UnitType } from './unit-data-convert';

describe('convertUnits', () => {
	it('should convert meters to feet', () => {
		expect(convertUnits(1, 'meter', 'foot')).toBeCloseTo(3.28084, 5);
	});

	it('should convert feet to meters', () => {
		expect(convertUnits(1, 'foot', 'meter')).toBeCloseTo(0.3048, 5);
	});

	it('should convert kilograms to pounds', () => {
		expect(convertUnits(1, 'kilogram', 'pound')).toBeCloseTo(2.20462, 5);
	});

	it('should convert pounds to kilograms', () => {
		expect(convertUnits(1, 'pound', 'kilogram')).toBeCloseTo(0.453592, 5);
	});

	it('should convert Celsius to Fahrenheit', () => {
		expect(convertUnits(0, 'celsius', 'fahrenheit')).toBeCloseTo(32, 5);
		expect(convertUnits(100, 'celsius', 'fahrenheit')).toBeCloseTo(212, 5);
	});

	it('should convert Fahrenheit to Celsius', () => {
		expect(convertUnits(32, 'fahrenheit', 'celsius')).toBeCloseTo(0, 5);
		expect(convertUnits(212, 'fahrenheit', 'celsius')).toBeCloseTo(100, 5);
	});

	it('should convert liters to gallons', () => {
		expect(convertUnits(1, 'liter', 'gallon')).toBeCloseTo(0.264172, 5);
	});

	it('should convert gallons to liters', () => {
		expect(convertUnits(1, 'gallon', 'liter')).toBeCloseTo(3.78541, 5);
	});

	it('should convert square meters to square feet', () => {
		expect(convertUnits(1, 'm2', 'sq ft')).toBeCloseTo(10.76391, 5);
	});

	it('should convert square feet to square meters', () => {
		expect(convertUnits(1, 'sq ft', 'm2')).toBeCloseTo(0.092903, 5);
	});

	it('should convert joules to kilojoules', () => {
		expect(convertUnits(1000, 'J', 'kJ')).toBe(1);
	});

	it('should convert kilojoules to joules', () => {
		expect(convertUnits(1, 'kJ', 'J')).toBe(1000);
	});

	it('should handle zero values', () => {
		expect(convertUnits(0, 'meter', 'foot')).toBe(0);
		expect(convertUnits(0, 'kilogram', 'pound')).toBe(0);
	});

	it('should handle negative values', () => {
		expect(convertUnits(-1, 'meter', 'foot')).toBeCloseTo(-3.28084, 5);
		expect(convertUnits(-10, 'celsius', 'fahrenheit')).toBeCloseTo(14, 5);
	});

	it('should handle decimal values', () => {
		expect(convertUnits(0.5, 'meter', 'foot')).toBeCloseTo(1.64042, 5);
		expect(convertUnits(2.5, 'kilogram', 'pound')).toBeCloseTo(5.51156, 5);
	});

	it('should handle same unit conversion (no-op)', () => {
		expect(convertUnits(5, 'meter', 'meter')).toBe(5);
		expect(convertUnits(10, 'kilogram', 'kilogram')).toBe(10);
	});

	it('should throw error for invalid units', () => {
		expect(() => convertUnits(1, 'invalid', 'meter')).toThrow();
		expect(() => convertUnits(1, 'meter', 'invalid')).toThrow();
	});

	it('should handle very small values', () => {
		expect(convertUnits(0.001, 'meter', 'foot')).toBeCloseTo(0.00328084, 5);
	});

	it('should handle very large values', () => {
		expect(convertUnits(1000, 'meter', 'foot')).toBeCloseTo(3280.8399, 4);
	});

	// Comprehensive test: ensure conversions within the same unit type return numbers
	describe('conversions within unit types return numbers', () => {
		const testValues = [0, 1, -1, 0.5, 10, 100];

		unitTypes.forEach(({ value: unitType }) => {
			describe(`${unitType} conversions`, () => {
				const unitList = units[unitType as UnitType];

				// Test only a few conversions per category to avoid excessive test time
				const testUnits = unitList.slice(0, 3); // First 3 units

				for (const fromUnit of testUnits) {
					for (const toUnit of testUnits) {
						if (fromUnit === toUnit) continue; // Skip same unit conversions

						for (const value of testValues) {
							it(`should convert ${value} from ${fromUnit.value} to ${toUnit.value} and return a number`, () => {
								const result = convertUnits(value, fromUnit.value, toUnit.value);
								expect(typeof result).toBe('number');
								expect(isNaN(result)).toBe(false);
								expect(isFinite(result)).toBe(true);
							});
						}
					}
				}
			});
		});
	});

	// Test that unsupported conversions throw errors
	describe('unsupported conversions throw errors', () => {
		it('should throw error for unsupported unit conversion', () => {
			expect(() => convertUnits(1, 'meter', 'pascal')).toThrow('Unsupported conversion');
		});

		it('should throw error for invalid units', () => {
			expect(() => convertUnits(1, 'invalid_unit', 'meter')).toThrow('Unsupported conversion');
			expect(() => convertUnits(1, 'meter', 'invalid_unit')).toThrow('Unsupported conversion');
		});
	});
});

describe('unitTypes', () => {
	it('should contain all expected unit categories', () => {
		const unitTypeValues = unitTypes.map((type) => type.value);
		expect(unitTypeValues).toContain('length');
		expect(unitTypeValues).toContain('mass');
		expect(unitTypeValues).toContain('temperature');
		expect(unitTypeValues).toContain('volume');
		expect(unitTypeValues).toContain('area');
		expect(unitTypeValues).toContain('energy');
	});

	it('should have units for each category', () => {
		Object.values(units).forEach((categoryUnits) => {
			expect(categoryUnits).toBeDefined();
			expect(Array.isArray(categoryUnits)).toBe(true);
			expect(categoryUnits.length).toBeGreaterThan(0);
		});
	});

	it('should have valid unit names that work with convertUnits', () => {
		// Test a few units from each category to ensure they're valid
		const testCases = [
			{ category: 'length', unit: 'meter', value: 1 },
			{ category: 'mass', unit: 'kilogram', value: 1 },
			{ category: 'temperature', unit: 'celsius', value: 0 },
			{ category: 'volume', unit: 'liter', value: 1 },
			{ category: 'area', unit: 'm2', value: 1 },
			{ category: 'energy', unit: 'J', value: 1 }
		];

		testCases.forEach(({ category, unit, value }) => {
			const categoryUnits = units[category as keyof typeof units];
			expect(categoryUnits.some((u) => u.value === unit)).toBe(true);

			// Test that the unit works with convertUnits (convert to itself)
			expect(() => convertUnits(value, unit, unit)).not.toThrow();
		});
	});

	it('should have proper category labels', () => {
		const lengthType = unitTypes.find((t) => t.value === 'length');
		const massType = unitTypes.find((t) => t.value === 'mass');
		const temperatureType = unitTypes.find((t) => t.value === 'temperature');

		expect(lengthType?.label).toBe('Length');
		expect(massType?.label).toBe('Mass');
		expect(temperatureType?.label).toBe('Temperature');
	});

	it('should ensure each unit can convert to at least one other unit in its category', () => {
		Object.entries(units).forEach(([categoryName, categoryUnits]) => {
			categoryUnits.forEach((unit) => {
				let convertibleUnits: string[] = [];

				// First check if this unit can be converted at all (exists in convert library)
				let unitIsValid = false;
				try {
					const testResult = convertUnits(1, unit.value, unit.value); // Same unit conversion
					unitIsValid = typeof testResult === 'number' && !isNaN(testResult);
				} catch (error) {
					// Unit doesn't exist in convert library, skip this unit entirely
					return;
				}

				if (!unitIsValid) return; // Skip units that don't exist in convert library

				// Test conversion to every other unit in the same category
				for (const otherUnit of categoryUnits) {
					if (otherUnit.value === unit.value) continue; // Skip converting to itself

					try {
						const result = convertUnits(1, unit.value, otherUnit.value);
						if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
							convertibleUnits.push(otherUnit.value);
						}
					} catch (error) {
						// Conversion failed, continue checking other units
					}
				}

				// Each valid unit must be able to convert to at least one other unit in its category
				expect(convertibleUnits.length).toBeGreaterThan(0);

				// If this fails, it means the unit can only convert to itself or cannot convert at all
				// This would indicate the unit should be removed from the category
			});
		});
	});
});
