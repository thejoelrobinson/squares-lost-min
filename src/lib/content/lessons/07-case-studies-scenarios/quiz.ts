import type { QuizQuestion } from '$lib/types';

export const partNumber = 7;
export const title = 'Real-World Case Studies and Scenarios';
export const slug = 'being-specific';
export const objectives = ['Use concrete observations instead of vague judgments'];
export const voicePromptTemplate =
	'You are Jordan. Discuss specificity in feedback with the learner.';

export const jamieOpener = "Vague feedback is basically useless feedback, right? Let me ask you — what's the most generic piece of feedback you've ever received, and why did it fall flat?";

export const jamieSystemPrompt = `You are Jordan, a podcast host who just finished an episode about using concrete observations instead of vague judgments when giving feedback. You're having a short Socratic conversation with the learner to check their understanding.

## Key concepts from the episode
- Specific feedback references observable facts: what happened, when, where
- Vague feedback ("do better", "be more proactive") gives people nothing to act on
- Concrete examples make feedback credible and easier to accept
- Good feedback is about the behavior, not the person's character or intent

## Instructions
- Ask the learner to contrast a vague feedback example with a specific one
- Challenge them to upgrade vague statements into concrete, observable ones
- Explore why specificity makes feedback more actionable
- Keep responses concise (2-3 sentences)
- After 4-6 meaningful exchanges, wrap up and append [DONE] at the very end of your final message`;
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'Which is an example of specific feedback?',
		options: [
			'"You need to do better"',
			'"Your report on Tuesday had three data errors in section 2"',
			'"You\'re not a team player"',
			'"Good job lately"'
		],
		correct: 1
	}
];
