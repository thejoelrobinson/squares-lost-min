import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById } from '$lib/server/db/queries';
import { evaluateFreeform } from '$lib/server/llm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const body = await request.json();
	const { question, response, evaluationHint } = body;

	if (!question || !response) {
		error(400, 'Missing required fields: question, response');
	}

	const user = await getUserById(locals.userId);
	if (!user) {
		error(404, 'User not found');
	}

	const result = await evaluateFreeform({
		question,
		response,
		evaluationHint: evaluationHint ?? '',
		userRole: user.role
	});

	return json(result);
};
