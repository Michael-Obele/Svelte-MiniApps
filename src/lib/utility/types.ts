// src/types.ts

export interface User {
	name: string;
	email: string;
	image: string;
	role: string; // Add the role property
}

export interface UserData {
	username: string;
	isAdmin: boolean;
	user?: User;
	expires?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface UserSessionData {
	data: UserData;
}

export interface UserDB {
	id: string;
	username: string;
	passwordHash: string;
	userAuthToken: string;
	isAdmin: boolean;
	createdAt: Date;
	updatedAt: Date;
	data?: string | null;
}
