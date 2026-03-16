import { env } from '$env/dynamic/private';

export function buildAgentConfig(
	lesson: { title: string; slug: string },
	user: { name: string; role: string; teamSize: number; comfortLevel: number },
	transcriptContext: string = ''
) {
	const isComprehensionCheck = transcriptContext.startsWith('MODE: COMPREHENSION CHECK');

	const greeting = isComprehensionCheck
		? `So we just wrapped up "${lesson.title}" — I'm curious what stuck with you. What's the big takeaway for you as a ${user.role}?`
		: `You had a question about "${lesson.title}"? I'm all ears — what's on your mind?`;

	return {
		agentId: env.ELEVENLABS_AGENT_ID,
		dynamicVariables: {
			user_name: user.name,
			user_role: user.role,
			team_size: user.teamSize,
			comfort_level: user.comfortLevel,
			lesson_title: lesson.title,
			lesson_slug: lesson.slug,
			transcript_context: transcriptContext || 'No additional context.',
			greeting
		}
	};
}
