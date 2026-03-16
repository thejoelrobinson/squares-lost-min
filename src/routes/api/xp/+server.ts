import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST({ request, locals }: RequestEvent) {
	if (!locals.userId) throw error(401, 'Not authenticated');

	const body = await request.json();
	const amount = typeof body.amount === 'number' ? body.amount : 0;
	if (amount <= 0) throw error(400, 'Invalid XP amount');

	const rows = await db
		.update(users)
		.set({ xp: sql`${users.xp} + ${amount}` })
		.where(eq(users.id, locals.userId))
		.returning({ xp: users.xp });

	return json({ xp: rows[0]?.xp ?? 0 });
}
