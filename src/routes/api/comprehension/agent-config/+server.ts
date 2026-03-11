import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById, getLessonBySlug } from '$lib/server/db/queries';
import { buildAgentConfig } from '$lib/server/elevenlabs';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const lessonId = url.searchParams.get('lessonId');
	if (!lessonId) {
		error(400, 'Missing required query parameter: lessonId');
	}

	const user = await getUserById(locals.userId);
	if (!user) {
		error(404, 'User not found');
	}

	const lesson = await getLessonBySlug(lessonId);
	if (!lesson) {
		error(404, 'Lesson not found');
	}

	const config = buildAgentConfig(
		{ title: lesson.title, slug: lesson.slug },
		{
			name: user.name,
			role: user.role,
			teamSize: user.teamSize,
			comfortLevel: user.comfortLevel
		}
	);

	return json(config);
};
