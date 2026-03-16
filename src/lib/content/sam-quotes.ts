/** Mr. Sam (Sam Walton) quotes shown at the end of comprehension quizzes. */
export interface SamQuote {
	text: string;
	source?: string;
}

export const samQuotes: Record<string, SamQuote> = {
	'why-feedback-matters': {
		text: 'Communicate everything you possibly can to your partners. The more they know, the more they\u2019ll understand.',
		source: 'Sam Walton, Made in America'
	}
};
