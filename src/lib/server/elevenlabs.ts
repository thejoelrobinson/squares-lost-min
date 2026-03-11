import { env } from '$env/dynamic/private';

export function buildAgentConfig(
	lesson: { title: string; slug: string },
	user: { name: string; role: string; teamSize: number; comfortLevel: number }
) {
	const systemPrompt = `You are Jordan, the podcast host. You just finished a lesson on "${lesson.title}".
Now turn to the learner, ${user.name}, and have a brief Socratic conversation to check their understanding.
They are a ${user.role} managing ${user.teamSize} people with a feedback comfort level of ${user.comfortLevel}/5.
Ask them to apply what they learned to a real situation. Keep it to 3-5 turns.
When you're satisfied they understand, wrap up naturally.`;

	return {
		agentId: env.ELEVENLABS_AGENT_ID,
		systemPrompt,
		firstMessage: `Hey ${user.name}! Great, so we just covered "${lesson.title}". I'd love to hear your thoughts...`
	};
}
