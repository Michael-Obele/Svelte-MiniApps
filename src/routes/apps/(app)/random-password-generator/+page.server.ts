import { prisma } from "@/server/db";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";



export const actions: Actions = {
    // Save action to save a password for a user
    save: async ({ request }) => {
        const data = await request.formData();
        const password = String(data.get('password'));
        let id = String(data.get('id'));

        let passwordHash = bcrypt.hashSync(password);

        // Log the password for debugging purposes


        // Check if the user exists in the database
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return fail(404, { invalid: true });
        }

        // Save the password for the user
        const savePassword = await prisma.userPassword.create({
            data: { passwordHash: password, userId: user.id }
        });
        console.log('savePassword', savePassword);
        return { saved: true };

    },
    view: async ({ request }) => {
        const data = await request.formData();
        const id = String(data.get('id'));

        // Ensure id is a string or undefined, not null
        // Check if the user exists in the database
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return fail(404, { invalid: true });
        }

        /**
         * Specifies fields to select from password records using Prisma's Select added to the model name SavePassword.
         * Only works for select to give `UserPasswordSelect`.
         * Each boolean value indicates whether to include a specific field in the query results.
         */
        let passwordDetails = {
            passwordHash: true,
            createdAt: true,
            details: true,
        };

        try {
            // Retrieve and display saved passwords for the user
            const displayPassword = await prisma.userPassword.findMany({
                where: { userId: user.id },
                select: passwordDetails,
                orderBy: { createdAt: 'desc' }
            });
            console.log('displayPassword', displayPassword);
            return { displayPassword };
        } catch (error) {
            console.error(error);
            return fail(400, { error: 'No passwords' });
        }
    },
    hide: async ({ request }) => {
        return { displayPassword: [] };
    }
};