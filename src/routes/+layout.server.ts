import type { LayoutServerLoad } from './$types';
import { getUserById, getProgressForUser } from '$lib/server/db/queries';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

function getTodayDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function getYesterdayDate(): string {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return d.toISOString().slice(0, 10);
}

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.userId) return { user: null, sparkCount: 0, streak: 0, xp: 0 };
	const user = await getUserById(locals.userId);
	if (!user) return { user: null, sparkCount: 0, streak: 0, xp: 0 };

	const allProgress = await getProgressForUser(locals.userId);
	const sparkCount = allProgress.filter((p) => p.lesson_progress.puzzleEarned).length;

	// Streak logic
	const today = getTodayDate();
	const yesterday = getYesterdayDate();
	let streak = user.currentStreak ?? 0;

	if (user.lastActiveDate !== today) {
		if (user.lastActiveDate === yesterday) {
			streak += 1;
		} else {
			streak = 1;
		}
		const longestStreak = Math.max(streak, user.longestStreak ?? 0);
		await db.update(users).set({
			currentStreak: streak,
			longestStreak,
			lastActiveDate: today
		}).where(eq(users.id, locals.userId));
	}

	return {
		user: user ?? null,
		sparkCount,
		streak,
		xp: user.xp ?? 0
	};
};
