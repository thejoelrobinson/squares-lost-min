import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lessonProgress, conversations, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getAllLessons } from '$lib/server/db/queries';
import { ulid } from 'ulidx';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	// Delete all progress and conversations for this user
	await db.delete(conversations).where(eq(conversations.userId, locals.userId));
	await db.delete(lessonProgress).where(eq(lessonProgress.userId, locals.userId));

	// Reset streak and XP
	await db
		.update(users)
		.set({ currentStreak: 0, longestStreak: 0, xp: 0, lastActiveDate: null })
		.where(eq(users.id, locals.userId));

	// Re-initialize progress: part 1 complete, part 2 available, rest locked
	const lessons = await getAllLessons();
	for (const lesson of lessons) {
		let status = 'locked';
		if (lesson.partNumber === 1) status = 'complete';
		else if (lesson.partNumber === 2) status = 'available';

		await db.insert(lessonProgress).values({
			id: ulid(),
			userId: locals.userId,
			lessonId: lesson.id,
			status,
			puzzleEarned: false
		});
	}

	return json({ ok: true });
};
