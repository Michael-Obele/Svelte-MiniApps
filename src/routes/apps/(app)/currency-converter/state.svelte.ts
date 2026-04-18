import { PersistedState } from 'runed';

export type CurrencyPair = {
	fromCurrency: string;
	toCurrency: string;
};

export type CurrencySelectionState = CurrencyPair & {
	recentPairs: CurrencyPair[];
};

const defaultSelection: CurrencySelectionState = {
	fromCurrency: 'USD',
	toCurrency: 'EUR',
	recentPairs: []
};

function createDefaultSelection(): CurrencySelectionState {
	return {
		fromCurrency: defaultSelection.fromCurrency,
		toCurrency: defaultSelection.toCurrency,
		recentPairs: [...defaultSelection.recentPairs]
	};
}

export const currencySelection = new PersistedState<CurrencySelectionState>(
	'currency-converter-selection',
	defaultSelection,
	{
		syncTabs: true
	}
);

export function normalizeCurrencyCode(value: string): string {
	return value.toUpperCase().trim();
}

export function rememberCurrencySelection(fromCurrency: string, toCurrency: string) {
	const nextPair = {
		fromCurrency: normalizeCurrencyCode(fromCurrency),
		toCurrency: normalizeCurrencyCode(toCurrency)
	};

	const recentPairs = [
		nextPair,
		...currencySelection.current.recentPairs.filter(
			(pair) =>
				pair.fromCurrency !== nextPair.fromCurrency || pair.toCurrency !== nextPair.toCurrency
		)
	].slice(0, 4);

	currencySelection.current = {
		fromCurrency: nextPair.fromCurrency,
		toCurrency: nextPair.toCurrency,
		recentPairs
	};
}

export function resetCurrencySelection() {
	currencySelection.current = createDefaultSelection();
}
