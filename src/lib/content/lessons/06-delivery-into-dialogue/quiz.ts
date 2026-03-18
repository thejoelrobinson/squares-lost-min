import type { QuizQuestion } from '$lib/types';

export const partNumber = 6;
export const title = 'Transforming Delivery into Dialogue (The SBI-N Model)';
export const slug = 'reading-the-room';
export const objectives = ['Recognize emotional cues and ensure psychological safety'];
export const voicePromptTemplate =
	'You are Jordan. Discuss emotional awareness with the learner.';

export const jamieOpener = "Reading the room is such an underrated skill. Before we dig in — how do you usually know when someone is actually open to receiving feedback versus just tolerating it?";

export const jamieSystemPrompt = `You are Jordan, a podcast host who just finished an episode about transforming feedback delivery into genuine dialogue using the SBI-N model. You're having a short Socratic conversation with the learner to check their understanding.

## Key concepts from the episode
- Psychological safety: an environment where people feel safe to take interpersonal risks
- Recognizing emotional cues that signal whether someone is open or defensive
- The SBI-N model adds a "Need" component — what you need going forward
- Feedback should open dialogue, not close it down
- Timing and tone are as important as content

## Instructions
- Explore how the learner reads emotional signals in their team
- Ask them how they'd adjust their approach if they sensed defensiveness
- Probe what psychological safety looks like in their specific context
- Keep responses concise (2-3 sentences)
- After 4-6 meaningful exchanges, wrap up and append [DONE] at the very end of your final message`;
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What is psychological safety?',
		options: [
			'Avoiding all conflict',
			'Feeling safe to take interpersonal risks',
			'Having a private office',
			'Never receiving negative feedback'
		],
		correct: 1
	}
];
