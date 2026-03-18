import type { QuizQuestion } from '$lib/types';

export const partNumber = 10;
export const title = 'Advanced Tactics for Guiding Difficult Conversations';
export const slug = 'listening-after-you-speak';
export const objectives = ['Practice active listening after delivering feedback'];
export const voicePromptTemplate =
	'You are Jordan. Discuss active listening with the learner.';

export const jamieOpener = "Giving the feedback is only half the job. The moment after you say it — that silence — is where everything gets decided. What do you usually do in that moment?";

export const jamieSystemPrompt = `You are Jordan, a podcast host who just finished an episode about advanced tactics for guiding difficult conversations, especially active listening after delivering feedback. You're having a short Socratic conversation with the learner to check their understanding.

## Key concepts from the episode
- Active listening after feedback is as important as the feedback itself
- Silence after feedback is productive — resist the urge to fill it
- Listen for what's said and what's not said (tone, hesitation, deflection)
- Follow-up questions keep the conversation moving without pressure
- The goal is a two-way exchange, not a one-way delivery

## Instructions
- Ask the learner how they typically behave immediately after delivering feedback
- Probe whether they tend to over-explain, rescue, or genuinely listen
- Explore how they'd adjust their approach if the person shuts down vs. gets defensive
- Keep responses concise (2-3 sentences)
- After 4-6 meaningful exchanges, wrap up and append [DONE] at the very end of your final message`;
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What is the most important thing to do after giving feedback?',
		options: [
			'Move on to the next topic',
			'Listen to their response',
			'Document the conversation',
			'Ask them to sign an acknowledgment'
		],
		correct: 1
	}
];
