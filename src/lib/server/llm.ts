import { env } from '$env/dynamic/private';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

export async function evaluateComprehension(params: {
	lessonTitle: string;
	lessonObjectives: string;
	userRole: string;
	userTeamSize: number;
	userComfortLevel: number;
	transcript: string;
}): Promise<{ understood: boolean; confidence: number; gaps: string[]; summary: string }> {
	if (!env.OPENROUTER_API_KEY) {
		return {
			understood: true,
			confidence: 0.85,
			gaps: [],
			summary: 'Development mode: comprehension evaluation skipped (no API key configured).'
		};
	}

	const systemPrompt = `You are evaluating a learner's understanding of "${params.lessonTitle}".
The learner is a ${params.userRole} who manages ${params.userTeamSize} people.
They rated their feedback comfort level at ${params.userComfortLevel}/5.

Lesson objectives:
${params.lessonObjectives}

Evaluate the following conversation/response for genuine understanding,
not rote repetition. Be generous but honest. Return JSON only.

Return a JSON object with this exact structure:
{
  "understood": boolean,
  "confidence": number between 0 and 1,
  "gaps": string[] (areas where understanding is weak, empty if none),
  "summary": string (brief assessment of comprehension)
}`;

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
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: params.transcript }
			],
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		console.error('OpenRouter API error:', response.status, await response.text());
		return {
			understood: true,
			confidence: 0.7,
			gaps: [],
			summary: 'Evaluation service temporarily unavailable. Defaulting to pass.'
		};
	}

	const data = await response.json();
	const content = data.choices?.[0]?.message?.content;

	if (!content) {
		return {
			understood: true,
			confidence: 0.7,
			gaps: [],
			summary: 'Could not parse evaluation response. Defaulting to pass.'
		};
	}

	try {
		const result = JSON.parse(content);
		return {
			understood: Boolean(result.understood),
			confidence: Number(result.confidence) || 0,
			gaps: Array.isArray(result.gaps) ? result.gaps : [],
			summary: String(result.summary || '')
		};
	} catch {
		return {
			understood: true,
			confidence: 0.7,
			gaps: [],
			summary: 'Could not parse evaluation response. Defaulting to pass.'
		};
	}
}

export async function evaluateFreeform(params: {
	question: string;
	response: string;
	evaluationHint: string;
	userRole: string;
}): Promise<{ score: number; feedback: string }> {
	if (!env.OPENROUTER_API_KEY) {
		return {
			score: 0.8,
			feedback: 'Development mode: freeform evaluation skipped (no API key configured).'
		};
	}

	const systemPrompt = `You are evaluating a learner's freeform response to a comprehension question.
The learner is a ${params.userRole}.

Question: ${params.question}

Evaluation criteria: ${params.evaluationHint}

Evaluate the response for genuine understanding and application.
Be generous but honest. Return JSON only.

Return a JSON object with this exact structure:
{
  "score": number between 0 and 1,
  "feedback": string (constructive feedback on their response)
}`;

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
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: params.response }
			],
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		console.error('OpenRouter API error:', response.status, await response.text());
		return {
			score: 0.7,
			feedback: 'Evaluation service temporarily unavailable. Defaulting to pass.'
		};
	}

	const data = await response.json();
	const content = data.choices?.[0]?.message?.content;

	if (!content) {
		return {
			score: 0.7,
			feedback: 'Could not parse evaluation response. Defaulting to pass.'
		};
	}

	try {
		const result = JSON.parse(content);
		return {
			score: Number(result.score) || 0,
			feedback: String(result.feedback || '')
		};
	} catch {
		return {
			score: 0.7,
			feedback: 'Could not parse evaluation response. Defaulting to pass.'
		};
	}
}
