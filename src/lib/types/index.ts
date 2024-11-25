export interface User {
	username: string;
	email?: string;
	id?: string;
}

export interface UserContext {
	username: string | null | undefined;
}
