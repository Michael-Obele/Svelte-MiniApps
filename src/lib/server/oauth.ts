import { Google } from 'arctic';

import {
	AUTH_GOOGLE_ID,
	AUTH_GOOGLE_SECRET,
	AUTH_GITHUB_ID,
	AUTH_GITHUB_SECRET
} from '$app/env/private';

import { PUBLIC_GOOGLE_CALLBACK_URL, PUBLIC_GITHUB_CALLBACK_URL } from '$app/env/public';
import { GitHub } from 'arctic';

export const github = new GitHub(AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, PUBLIC_GITHUB_CALLBACK_URL);
export const google = new Google(AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, PUBLIC_GOOGLE_CALLBACK_URL);
