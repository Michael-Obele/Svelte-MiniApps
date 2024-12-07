import { Google } from "arctic";
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from "$env/static/private";
import { PUBLIC_GOOGLE_CALLBACK_URL } from '$env/static/public';

import { GitHub } from "arctic";
import { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET } from "$env/static/private";
import { PUBLIC_GITHUB_CALLBACK_URL } from '$env/static/public';

export const github = new GitHub(
    AUTH_GITHUB_ID, 
    AUTH_GITHUB_SECRET, 
    PUBLIC_GITHUB_CALLBACK_URL
);

export const google = new Google(
    AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET,
    PUBLIC_GOOGLE_CALLBACK_URL
);
