import type { LayoutServerLoad } from './$types';
import { getUserById, getProgressForUser } from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.userId) return { user: null, sparkCount: 0 };
	const user = await getUserById(locals.userId);
	if (!user) return { user: null, sparkCount: 0 };

	const allProgress = await getProgressForUser(locals.userId);
	const sparkCount = allProgress.filter((p) => p.lesson_progress.puzzleEarned).length;

	return { user: user ?? null, sparkCount };
};
