import * as db from "$lib/server/database"

import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('sessionId');
    if (!sessionId) redirect(308, "/login");

    const session = ( await db.getSession(sessionId) ).session;
    if (!session) redirect(308, "/login");

	const user = await db.getUserById( session.id );
    if (!user) redirect(308, "/login");

	
    return { user: user.user };
};