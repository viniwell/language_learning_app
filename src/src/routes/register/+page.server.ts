import * as db from "$lib/server/database"

import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions } from "@sveltejs/kit"

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const email = String(data.get("email"));
        const username = String(data.get("username"));
        const password = String(data.get("password"))

        console.log(`${email}, ${username}, ${password}`)

        const user = await db.register(email, username, password);
        if (!user || user.status != 201) throw error(user.status, user.message);

        const session = await db.login(email, password);
        if (!session) throw error(500, "Internal server error, please try again later")
        
        
        cookies.set("sessionId", String(session.sessionId), {path: "/"});
        redirect(303, "/dashboard");
    }
}