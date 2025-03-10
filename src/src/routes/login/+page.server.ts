import * as db from "$lib/server/database"

import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions } from "@sveltejs/kit"

export const actions: Actions = {
    login: async ({ cookies, request }) => {
        const data = await request.formData();
        const credential = String(data.get("credential"));
        const password = String(data.get("password"))

        const session = await db.login(credential, password);
        if (!session) throw error(500, "Internal server error, please try again later")
        
        
        cookies.set("sessionId", String(session.sessionId), {path: "/"});

        redirect(303, "/dashboard");
    }
}