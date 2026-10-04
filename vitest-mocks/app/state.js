// Vitest mock for `$app/state`. SvelteKit 3 exposes plain reactive values here
// (rather than stores), so tests can read `page.url`, `page.data`, etc. directly.
export const page = {
	url: new URL('http://localhost/'),
	params: {},
	route: { id: null },
	status: 200,
	error: null,
	data: {},
	state: {},
	form: null
};

export const navigating = {
	from: null,
	to: null,
	type: null,
	delta: undefined
};

export const updated = {
	current: false,
	check: () => Promise.resolve(false)
};
