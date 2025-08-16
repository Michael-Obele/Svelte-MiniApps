export interface UnitOption {
	value: string;
	label: string;
}

export interface UnitTypeOption {
	value: string;
	label: string;
}

export type UnitType = 'length' | 'temperature' | 'volume' | 'mass' | 'area' | 'time';

export type ConversionFunction = (value: number) => number;

export type ConversionFactors = {
	[K in UnitType]: {
		[key: string]: {
			[key: string]: number | ConversionFunction;
		};
	};
};

export const unitTypes: UnitTypeOption[] = [
	{ value: 'length', label: 'Length' },
	{ value: 'temperature', label: 'Temperature' },
	{ value: 'volume', label: 'Volume' },
	{ value: 'mass', label: 'Mass' },
	{ value: 'area', label: 'Area' },
	{ value: 'time', label: 'Time' }
];

export const units: Record<UnitType, UnitOption[]> = {
	length: [
		{ value: 'meter', label: 'Meter (m)' },
		{ value: 'foot', label: 'Foot (ft)' },
		{ value: 'inch', label: 'Inch (in)' },
		{ value: 'centimeter', label: 'Centimeter (cm)' },
		{ value: 'kilometer', label: 'Kilometer (km)' },
		{ value: 'mile', label: 'Mile (mi)' },
		{ value: 'yard', label: 'Yard (yd)' },
		{ value: 'millimeter', label: 'Millimeter (mm)' }
	],
	temperature: [
		{ value: 'celsius', label: 'Celsius (°C)' },
		{ value: 'fahrenheit', label: 'Fahrenheit (°F)' },
		{ value: 'kelvin', label: 'Kelvin (K)' }
	],
	volume: [
		{ value: 'liter', label: 'Liter (L)' },
		{ value: 'milliliter', label: 'Milliliter (mL)' },
		{ value: 'gallon', label: 'Gallon (gal)' },
		{ value: 'quart', label: 'Quart (qt)' },
		{ value: 'pint', label: 'Pint (pt)' },
		{ value: 'cup', label: 'Cup' },
		{ value: 'fluidounce', label: 'Fluid Ounce (fl oz)' }
	],
	mass: [
		{ value: 'kilogram', label: 'Kilogram (kg)' },
		{ value: 'gram', label: 'Gram (g)' },
		{ value: 'pound', label: 'Pound (lb)' },
		{ value: 'ounce', label: 'Ounce (oz)' },
		{ value: 'ton', label: 'Metric Ton (t)' },
		{ value: 'stone', label: 'Stone (st)' }
	],
	area: [
		{ value: 'squaremeter', label: 'Square Meter (m²)' },
		{ value: 'squarefoot', label: 'Square Foot (ft²)' },
		{ value: 'squareinch', label: 'Square Inch (in²)' },
		{ value: 'squarekilometer', label: 'Square Kilometer (km²)' },
		{ value: 'acre', label: 'Acre' },
		{ value: 'hectare', label: 'Hectare (ha)' }
	],
	time: [
		{ value: 'second', label: 'Second (s)' },
		{ value: 'minute', label: 'Minute (min)' },
		{ value: 'hour', label: 'Hour (h)' },
		{ value: 'day', label: 'Day' },
		{ value: 'week', label: 'Week' },
		{ value: 'month', label: 'Month' },
		{ value: 'year', label: 'Year' }
	]
};

export const conversionFactors: ConversionFactors = {
	length: {
		meter: {
			foot: 3.28084,
			inch: 39.3701,
			centimeter: 100,
			kilometer: 0.001,
			mile: 0.000621371,
			yard: 1.09361,
			millimeter: 1000
		},
		foot: {
			meter: 0.3048,
			inch: 12,
			centimeter: 30.48,
			kilometer: 0.0003048,
			mile: 0.000189394,
			yard: 0.333333,
			millimeter: 304.8
		},
		inch: {
			meter: 0.0254,
			foot: 0.0833333,
			centimeter: 2.54,
			kilometer: 0.0000254,
			mile: 0.0000157828,
			yard: 0.0277778,
			millimeter: 25.4
		},
		centimeter: {
			meter: 0.01,
			foot: 0.0328084,
			inch: 0.393701,
			kilometer: 0.00001,
			mile: 0.00000621371,
			yard: 0.0109361,
			millimeter: 10
		},
		kilometer: {
			meter: 1000,
			foot: 3280.84,
			inch: 39370.1,
			centimeter: 100000,
			mile: 0.621371,
			yard: 1093.61,
			millimeter: 1000000
		},
		mile: {
			meter: 1609.34,
			foot: 5280,
			inch: 63360,
			centimeter: 160934,
			kilometer: 1.60934,
			yard: 1760,
			millimeter: 1609340
		},
		yard: {
			meter: 0.9144,
			foot: 3,
			inch: 36,
			centimeter: 91.44,
			kilometer: 0.0009144,
			mile: 0.000568182,
			millimeter: 914.4
		},
		millimeter: {
			meter: 0.001,
			foot: 0.00328084,
			inch: 0.0393701,
			centimeter: 0.1,
			kilometer: 0.000001,
			mile: 0.00000062137,
			yard: 0.00109361
		}
	},
	temperature: {
		celsius: {
			fahrenheit: (value: number) => value * 1.8 + 32,
			kelvin: (value: number) => value + 273.15
		},
		fahrenheit: {
			celsius: (value: number) => (value - 32) / 1.8,
			kelvin: (value: number) => (value - 32) / 1.8 + 273.15
		},
		kelvin: {
			celsius: (value: number) => value - 273.15,
			fahrenheit: (value: number) => (value - 273.15) * 1.8 + 32
		}
	},
	volume: {
		liter: {
			milliliter: 1000,
			gallon: 0.264172,
			quart: 1.05669,
			pint: 2.11338,
			cup: 4.22675,
			fluidounce: 33.814
		},
		milliliter: {
			liter: 0.001,
			gallon: 0.000264172,
			quart: 0.00105669,
			pint: 0.00211338,
			cup: 0.00422675,
			fluidounce: 0.033814
		},
		gallon: {
			liter: 3.78541,
			milliliter: 3785.41,
			quart: 4,
			pint: 8,
			cup: 16,
			fluidounce: 128
		},
		quart: {
			liter: 0.946353,
			milliliter: 946.353,
			gallon: 0.25,
			pint: 2,
			cup: 4,
			fluidounce: 32
		},
		pint: {
			liter: 0.473176,
			milliliter: 473.176,
			gallon: 0.125,
			quart: 0.5,
			cup: 2,
			fluidounce: 16
		},
		cup: {
			liter: 0.236588,
			milliliter: 236.588,
			gallon: 0.0625,
			quart: 0.25,
			pint: 0.5,
			fluidounce: 8
		},
		fluidounce: {
			liter: 0.0295735,
			milliliter: 29.5735,
			gallon: 0.0078125,
			quart: 0.03125,
			pint: 0.0625,
			cup: 0.125
		}
	},
	mass: {
		kilogram: {
			gram: 1000,
			pound: 2.20462,
			ounce: 35.274,
			ton: 0.001,
			stone: 0.157473
		},
		gram: {
			kilogram: 0.001,
			pound: 0.00220462,
			ounce: 0.035274,
			ton: 0.000001,
			stone: 0.000157473
		},
		pound: {
			kilogram: 0.453592,
			gram: 453.592,
			ounce: 16,
			ton: 0.000453592,
			stone: 0.0714286
		},
		ounce: {
			kilogram: 0.0283495,
			gram: 28.3495,
			pound: 0.0625,
			ton: 0.0000283495,
			stone: 0.00446429
		},
		ton: {
			kilogram: 1000,
			gram: 1000000,
			pound: 2204.62,
			ounce: 35274,
			stone: 157.473
		},
		stone: {
			kilogram: 6.35029,
			gram: 6350.29,
			pound: 14,
			ounce: 224,
			ton: 0.00635029
		}
	},
	area: {
		squaremeter: {
			squarefoot: 10.7639,
			squareinch: 1550,
			squarekilometer: 0.000001,
			acre: 0.000247105,
			hectare: 0.0001
		},
		squarefoot: {
			squaremeter: 0.092903,
			squareinch: 144,
			squarekilometer: 0.0000000929,
			acre: 0.0000229568,
			hectare: 0.00000929
		},
		squareinch: {
			squaremeter: 0.00064516,
			squarefoot: 0.00694444,
			squarekilometer: 0.00000000064516,
			acre: 0.00000015942,
			hectare: 0.000000064516
		},
		squarekilometer: {
			squaremeter: 1000000,
			squarefoot: 10763900,
			squareinch: 1550003000,
			acre: 247.105,
			hectare: 100
		},
		acre: {
			squaremeter: 4046.86,
			squarefoot: 43560,
			squareinch: 6272640,
			squarekilometer: 0.00404686,
			hectare: 0.404686
		},
		hectare: {
			squaremeter: 10000,
			squarefoot: 107639,
			squareinch: 15500031,
			squarekilometer: 0.01,
			acre: 2.47105
		}
	},
	time: {
		second: {
			minute: 0.0166667,
			hour: 0.000277778,
			day: 0.0000115741,
			week: 0.00000165344,
			month: 0.000000380518,
			year: 0.0000000317098
		},
		minute: {
			second: 60,
			hour: 0.0166667,
			day: 0.000694444,
			week: 0.0000992063,
			month: 0.0000228311,
			year: 0.00000190259
		},
		hour: {
			second: 3600,
			minute: 60,
			day: 0.0416667,
			week: 0.00595238,
			month: 0.00136986,
			year: 0.000114155
		},
		day: {
			second: 86400,
			minute: 1440,
			hour: 24,
			week: 0.142857,
			month: 0.0328767,
			year: 0.00273973
		},
		week: {
			second: 604800,
			minute: 10080,
			hour: 168,
			day: 7,
			month: 0.230137,
			year: 0.0191781
		},
		month: {
			second: 2629746,
			minute: 43829.1,
			hour: 730.485,
			day: 30.4369,
			week: 4.34812,
			year: 0.0833333
		},
		year: {
			second: 31556952,
			minute: 525949,
			hour: 8765.82,
			day: 365.242,
			week: 52.1775,
			month: 12
		}
	}
};

/**
 * Formats the conversion result based on its magnitude
 */
export function formatResult(result: number): string {
	if (isNaN(result)) {
		return 'NaN'; // Handle NaN values
	}
	if (!isFinite(result)) {
		return result.toString(); // Handle Infinity and -Infinity
	}

	if ((result < 0.001 && result > 0) || result > 1000000) {
		// Use Intl.NumberFormat for exponential notation with commas for very small or very large numbers
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 4,
			maximumFractionDigits: 4,
			notation: 'scientific'
		}).format(result);
	} else {
		// Round to 6 decimal places, remove trailing zeros, and add comma formatting
		const formatted = result.toFixed(6).replace(/\.?0+$/, '');
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 6 // Allow up to 6 decimal places for non-exponential numbers
		}).format(parseFloat(formatted)); // Parse back to number for Intl.NumberFormat
	}
}

/**
 * Gets the default units for a given unit type
 */
export function getDefaultUnits(unitType: UnitType): { from: string; to: string } {
	const unitsForType = units[unitType];
	return {
		from: unitsForType[0].value,
		to: unitsForType[1] ? unitsForType[1].value : unitsForType[0].value
	};
}
