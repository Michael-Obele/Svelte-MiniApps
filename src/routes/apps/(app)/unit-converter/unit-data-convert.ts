import convert, { type Unit } from 'convert';

export interface UnitOption {
	value: string;
	label: string;
}

export interface UnitTypeOption {
	value: string;
	label: string;
}

// All unit types supported by the convert library
export type UnitType =
	| 'length'
	| 'temperature'
	| 'volume'
	| 'mass'
	| 'area'
	| 'time'
	| 'angle'
	| 'data'
	| 'energy'
	| 'force'
	| 'power'
	| 'pressure';

export const unitTypes: UnitTypeOption[] = [
	{ value: 'length', label: 'Length' },
	{ value: 'temperature', label: 'Temperature' },
	{ value: 'volume', label: 'Volume' },
	{ value: 'mass', label: 'Mass' },
	{ value: 'area', label: 'Area' },
	{ value: 'time', label: 'Time' },
	{ value: 'angle', label: 'Angle' },
	{ value: 'data', label: 'Data' },
	{ value: 'energy', label: 'Energy' },
	{ value: 'force', label: 'Force' },
	{ value: 'power', label: 'Power' },
	{ value: 'pressure', label: 'Pressure' }
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
		{ value: 'millimeter', label: 'Millimeter (mm)' },
		{ value: 'micrometer', label: 'Micrometer (μm)' },
		{ value: 'nanometer', label: 'Nanometer (nm)' },
		{ value: 'picometer', label: 'Picometer (pm)' },
		{ value: 'femtometer', label: 'Femtometer (fm)' },
		{ value: 'nautical mile', label: 'Nautical Mile (nmi)' },
		{ value: 'light-year', label: 'Light-Year (ly)' }
	],
	temperature: [
		{ value: 'celsius', label: 'Celsius (°C)' },
		{ value: 'fahrenheit', label: 'Fahrenheit (°F)' },
		{ value: 'kelvin', label: 'Kelvin (K)' },
		{ value: 'rankine', label: 'Rankine (°R)' }
	],
	volume: [
		{ value: 'liter', label: 'Liter (L)' },
		{ value: 'milliliter', label: 'Milliliter (mL)' },
		{ value: 'gallon', label: 'Gallon (gal)' },
		{ value: 'quart', label: 'Quart (qt)' },
		{ value: 'pint', label: 'Pint (pt)' },
		{ value: 'cup', label: 'Cup (c)' },
		{ value: 'tablespoon', label: 'Tablespoon (tbsp)' },
		{ value: 'teaspoon', label: 'Teaspoon (tsp)' },
		{ value: 'cubic meter', label: 'Cubic Meter (m³)' },
		{ value: 'cubic foot', label: 'Cubic Foot (ft³)' },
		{ value: 'cubic inch', label: 'Cubic Inch (in³)' }
	],
	mass: [
		{ value: 'kilogram', label: 'Kilogram (kg)' },
		{ value: 'gram', label: 'Gram (g)' },
		{ value: 'pound', label: 'Pound (lb)' },
		{ value: 'ounce', label: 'Ounce (oz)' },
		{ value: 'milligram', label: 'Milligram (mg)' },
		{ value: 'microgram', label: 'Microgram (μg)' },
		{ value: 'nanogram', label: 'Nanogram (ng)' },
		{ value: 'picogram', label: 'Picogram (pg)' },
		{ value: 'grain', label: 'Grain (gr)' },
		{ value: 'tonne', label: 'Tonne (t)' }
	],
	area: [
		{ value: 'm2', label: 'Square Meter (m²)' },
		{ value: 'sq ft', label: 'Square Foot (ft²)' },
		{ value: 'sq in', label: 'Square Inch (in²)' },
		{ value: 'km2', label: 'Square Kilometer (km²)' },
		{ value: 'ac', label: 'Acre' },
		{ value: 'hectare', label: 'Hectare (ha)' },
		{ value: 'sq mi', label: 'Square Mile (mi²)' },
		{ value: 'sq yd', label: 'Square Yard (yd²)' },
		{ value: 'cm2', label: 'Square Centimeter (cm²)' },
		{ value: 'mm2', label: 'Square Millimeter (mm²)' },
		{ value: 'are', label: 'Are (a)' }
	],
	time: [
		{ value: 'second', label: 'Second (s)' },
		{ value: 'millisecond', label: 'Millisecond (ms)' },
		{ value: 'microsecond', label: 'Microsecond (μs)' },
		{ value: 'nanosecond', label: 'Nanosecond (ns)' },
		{ value: 'minute', label: 'Minute (min)' },
		{ value: 'hour', label: 'Hour (h)' },
		{ value: 'day', label: 'Day' },
		{ value: 'week', label: 'Week' },
		{ value: 'month', label: 'Month' },
		{ value: 'year', label: 'Year' },
		{ value: 'decade', label: 'Decade' },
		{ value: 'century', label: 'Century' },
		{ value: 'millennium', label: 'Millennium' }
	],
	angle: [
		{ value: 'radian', label: 'Radian (rad)' },
		{ value: 'degree', label: 'Degree (°)' },
		{ value: 'gradian', label: 'Gradian (gon)' },
		{ value: 'turn', label: 'Turn' },
		{ value: 'arcminute', label: 'Arcminute (′)' },
		{ value: 'arcsecond', label: 'Arcsecond (″)' }
	],
	data: [
		{ value: 'bit', label: 'Bit' },
		{ value: 'byte', label: 'Byte (B)' },
		{ value: 'kilobit', label: 'Kilobit (Kb)' },
		{ value: 'kilobyte', label: 'Kilobyte (KB)' },
		{ value: 'megabit', label: 'Megabit (Mb)' },
		{ value: 'megabyte', label: 'Megabyte (MB)' },
		{ value: 'gigabit', label: 'Gigabit (Gb)' },
		{ value: 'gigabyte', label: 'Gigabyte (GB)' },
		{ value: 'terabit', label: 'Terabit (Tb)' },
		{ value: 'terabyte', label: 'Terabyte (TB)' },
		{ value: 'petabit', label: 'Petabit (Pb)' },
		{ value: 'petabyte', label: 'Petabyte (PB)' },
		{ value: 'kibibit', label: 'Kibibit (Kib)' },
		{ value: 'kibibyte', label: 'Kibibyte (KiB)' },
		{ value: 'mebibit', label: 'Mebibit (Mib)' },
		{ value: 'mebibyte', label: 'Mebibyte (MiB)' },
		{ value: 'gibibit', label: 'Gibibit (Gib)' },
		{ value: 'gibibyte', label: 'Gibibyte (GiB)' },
		{ value: 'tebibit', label: 'Tebibit (Tib)' },
		{ value: 'tebibyte', label: 'Tebibyte (TiB)' },
		{ value: 'pebibit', label: 'Pebibit (Pib)' },
		{ value: 'pebibyte', label: 'Pebibyte (PiB)' },
		{ value: 'nibble', label: 'Nibble' },
		{ value: 'hextet', label: 'Hextet' }
	],
	energy: [
		{ value: 'J', label: 'Joule (J)' },
		{ value: 'joule', label: 'Joule (J)' },
		{ value: 'kJ', label: 'Kilojoule (kJ)' },
		{ value: 'kilojoule', label: 'Kilojoule (kJ)' },
		{ value: 'Wh', label: 'Watt Hour (Wh)' },
		{ value: 'watt-hour', label: 'Watt Hour (Wh)' },
		{ value: 'kWh', label: 'Kilowatt Hour (kWh)' },
		{ value: 'kilowatt-hour', label: 'Kilowatt Hour (kWh)' },
		{ value: 'MWh', label: 'Megawatt Hour (MWh)' },
		{ value: 'megawatt-hour', label: 'Megawatt Hour (MWh)' },
		{ value: 'GWh', label: 'Gigawatt Hour (GWh)' },
		{ value: 'gigawatt-hour', label: 'Gigawatt Hour (GWh)' },
		{ value: 'TWh', label: 'Terawatt Hour (TWh)' },
		{ value: 'PWh', label: 'Petawatt Hour (PWh)' }
	],
	force: [
		{ value: 'newton', label: 'Newton (N)' },
		{ value: 'kilonewton', label: 'Kilonewton (kN)' },
		{ value: 'dyne', label: 'Dyne (dyn)' },
		{ value: 'pound-force', label: 'Pound Force (lbf)' },
		{ value: 'pound of force', label: 'Pound Force (lbf)' },
		{ value: 'kip', label: 'Kip' },
		{ value: 'poundal', label: 'Poundal (pdl)' },
		{ value: 'kilogram-force', label: 'Kilogram Force (kgf)' },
		{ value: 'tonne-force', label: 'Tonne Force (tf)' }
	],
	power: [
		{ value: 'watt', label: 'Watt (W)' },
		{ value: 'kilowatt', label: 'Kilowatt (kW)' },
		{ value: 'megawatt', label: 'Megawatt (MW)' },
		{ value: 'gigawatt', label: 'Gigawatt (GW)' },
		{ value: 'terawatt', label: 'Terawatt (TW)' },
		{ value: 'petawatt', label: 'Petawatt (PW)' },
		{ value: 'horsepower', label: 'Horsepower (hp)' },
		{ value: 'milliwatt', label: 'Milliwatt (mW)' },
		{ value: 'microwatt', label: 'Microwatt (μW)' },
		{ value: 'nanowatt', label: 'Nanowatt (nW)' },
		{ value: 'picowatt', label: 'Picowatt (pW)' },
		{ value: 'femtowatt', label: 'Femtowatt (fW)' }
	],
	pressure: [
		{ value: 'pascal', label: 'Pascal (Pa)' },
		{ value: 'kilopascal', label: 'Kilopascal (kPa)' },
		{ value: 'megapascal', label: 'Megapascal (MPa)' },
		{ value: 'gigapascal', label: 'Gigapascal (GPa)' },
		{ value: 'bar', label: 'Bar' },
		{ value: 'millibar', label: 'Millibar (mbar)' },
		{ value: 'atmosphere', label: 'Atmosphere (atm)' },
		{ value: 'torr', label: 'Torr' },
		{ value: 'millitorr', label: 'Millitorr (mTorr)' },
		{ value: 'pound per square inch', label: 'Pounds per Square Inch (psi)' },
		{ value: 'inch of water', label: 'Inch of Water (inH₂O)' },
		{ value: 'inch of mercury', label: 'Inch of Mercury (inHg)' }
	]
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

/**
 * Converts a value from one unit to another using the convert library
 */
export function convertUnits(value: number, fromUnit: string, toUnit: string): number {
	try {
		// Type assertion since we validate units from our predefined list
		return convert(value, fromUnit as Unit).to(toUnit as Unit);
	} catch (error) {
		console.error(`Conversion error: ${fromUnit} to ${toUnit}`, error);
		throw new Error(`Unsupported conversion from ${fromUnit} to ${toUnit}`);
	}
}
