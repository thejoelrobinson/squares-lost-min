import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById, getLessonBySlug } from '$lib/server/db/queries';
import { lessonContent } from '$lib/content/lesson-data';
import { evaluateComprehension } from '$lib/server/llm';
import { env } from '$env/dynamic/private';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

const DEV_REPLIES = [
	"Oh yeah, the presentation! I thought it went pretty well overall. What's on your mind?",
	"Hmm, okay, I hear you. I guess I was just trying to help — Taylor was taking a while to answer that question. But I see what you mean about jumping in.",
	"That's fair. I didn't realize the client noticed. I'll be more mindful about letting Taylor finish next time.",
	"Oh wow, thanks for saying that about the backup slide! I actually spent an extra hour Sunday night putting those together, just in case.",
	"Was there anything else from the presentation you wanted to discuss?",
	"Thanks for the feedback, boss. I really appreciate you being direct with me. I'll work on being more aware of when to step back during Q&A, and I'm glad the backup slides paid off. [DONE]"
];

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const body = await request.json();
	const { action } = body;

	if (action === 'message') {
		return handleMessage(body, locals.userId);
	} else if (action === 'evaluate') {
		return handleEvaluate(body, locals.userId);
	}

	error(400, 'Invalid action');
};

async function handleMessage(
	body: { lessonSlug: string; message: string; history: Array<{ role: string; content: string }> },
	userId: string
) {
	const { lessonSlug, message, history = [] } = body;
	if (!lessonSlug || !message) {
		error(400, 'Missing required fields');
	}

	const [user, lesson] = await Promise.all([getUserById(userId), getLessonBySlug(lessonSlug)]);
	if (!user) error(404, 'User not found');
	if (!lesson) error(404, 'Lesson not found');

	const content = lessonContent[lessonSlug];
	if (!content?.jamieSystemPrompt) {
		error(400, 'Lesson does not support roleplay');
	}

	if (!env.OPENROUTER_API_KEY) {
		// Use conversation turn count to pick the next dev reply
		const turnIndex = Math.floor(history.length / 2);
		const reply = DEV_REPLIES[Math.min(turnIndex, DEV_REPLIES.length - 1)];
		const done = reply.includes('[DONE]');
		return json({ reply: reply.replace('[DONE]', '').trim(), done });
	}

	const model = env.LLM_MODEL || DEFAULT_MODEL;

	const response = await fetch(OPENROUTER_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENROUTER_API_KEY}`
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: content.jamieSystemPrompt },
				...history,
				{ role: 'user', content: message }
			]
		})
	});

	if (!response.ok) {
		console.error('OpenRouter API error:', response.status, await response.text());
		error(502, 'LLM service unavailable');
	}

	const data = await response.json();
	const rawReply: string =
		data.choices?.[0]?.message?.content ?? "I'm not sure what to say to that.";

	const done = rawReply.includes('[DONE]');
	const reply = rawReply.replace('[DONE]', '').trim();

	return json({ reply, done });
}

async function handleEvaluate(
	body: { lessonSlug: string; transcript: Array<{ role: string; content: string }> },
	userId: string
) {
	const { lessonSlug, transcript } = body;
	if (!lessonSlug || !transcript) {
		error(400, 'Missing required fields');
	}

	const [user, lesson] = await Promise.all([getUserById(userId), getLessonBySlug(lessonSlug)]);
	if (!user) error(404, 'User not found');
	if (!lesson) error(404, 'Lesson not found');

	const content = lessonContent[lessonSlug];
	const objectives = content?.scenarioEvaluationObjectives ?? content?.objectives ?? [];

	const feedback = await evaluateComprehension({
		lessonTitle: lesson.title,
		lessonObjectives: objectives,
		userRole: user.role,
		userTeamSize: user.teamSize,
		userComfortLevel: user.comfortLevel,
		transcript
	});

	return json(feedback);
}
