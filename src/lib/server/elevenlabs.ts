import { env } from '$env/dynamic/private';

export function buildAgentConfig(
	lesson: { title: string; slug: string },
	user: { name: string; role: string; teamSize: number; comfortLevel: number },
	transcriptContext: string = '',
	scenarioGreeting?: string
) {
	const isComprehensionCheck = transcriptContext.startsWith('MODE: COMPREHENSION CHECK');
	const isScenarioRoleplay = transcriptContext.startsWith('MODE: SCENARIO ROLEPLAY');

	let greeting: string;
	let jamieIdentity: string;

	if (isScenarioRoleplay && scenarioGreeting) {
		greeting = scenarioGreeting;
		jamieIdentity = `You are Jamie, a friendly and enthusiastic associate on ${user.name}'s team at Walmart. You report to ${user.name}. You are NOT a coach, host, or teacher — you are a real team member sitting down for a 1:1 with your manager. You speak casually, use "yeah," "I mean," "honestly," and sound like a real person. You have no knowledge of feedback frameworks, SBI, or leadership theory — you're just an associate having a conversation with your boss.`;
	} else if (isComprehensionCheck) {
		greeting = `So we just wrapped up "${lesson.title}" — I'm curious what stuck with you. What's the big takeaway for you as a ${user.role}?`;
		jamieIdentity = `You are Jamie, the host of Walmart Academy's the Art of Feedback — a warm, sharp, Socratic leadership coach who helps Walmart managers master feedback conversations. You guide learners through reflection without re-teaching. You are assessing what they retained, not lecturing.`;
	} else {
		greeting = `You had a question about "${lesson.title}"? I'm all ears — what's on your mind?`;
		jamieIdentity = `You are Jamie, the host of Walmart Academy's the Art of Feedback — a warm, sharp, knowledgeable podcast host who helps Walmart managers master feedback conversations. The learner paused the episode to ask you something. Be helpful, direct, and reference what they've heard so far.`;
	}

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
			jamie_identity: jamieIdentity,
			greeting
		}
	};
}
