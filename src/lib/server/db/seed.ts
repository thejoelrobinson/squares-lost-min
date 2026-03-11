import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { ulid } from 'ulidx';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || 'local.db';
const client = new Database(DATABASE_URL);
const db = drizzle(client, { schema });

const lessonData: Array<{
	partNumber: number;
	title: string;
	slug: string;
	puzzlePosition: string | null;
}> = [
	{ partNumber: 1, title: 'Getting to Know You', slug: 'onboarding', puzzlePosition: null },
	{
		partNumber: 2,
		title: 'Why Feedback Matters',
		slug: 'why-feedback-matters',
		puzzlePosition: 'top-left'
	},
	{
		partNumber: 3,
		title: 'The SBI Framework',
		slug: 'sbi-framework',
		puzzlePosition: 'top-center'
	},
	{
		partNumber: 4,
		title: 'Timing Is Everything',
		slug: 'timing-is-everything',
		puzzlePosition: 'top-right'
	},
	{
		partNumber: 5,
		title: 'Reading the Room',
		slug: 'reading-the-room',
		puzzlePosition: 'middle-left'
	},
	{ partNumber: 6, title: 'Being Specific', slug: 'being-specific', puzzlePosition: 'center' },
	{
		partNumber: 7,
		title: 'The Hard Conversations',
		slug: 'hard-conversations',
		puzzlePosition: 'middle-right'
	},
	{
		partNumber: 8,
		title: 'Listening After You Speak',
		slug: 'listening-after-you-speak',
		puzzlePosition: 'bottom-left'
	},
	{
		partNumber: 9,
		title: 'Making It Actionable',
		slug: 'making-it-actionable',
		puzzlePosition: 'bottom-center'
	},
	{
		partNumber: 10,
		title: 'Putting It All Together',
		slug: 'putting-it-together',
		puzzlePosition: 'bottom-right'
	}
];

async function seed() {
	console.log(`Seeding database at: ${DATABASE_URL}`);

	// Delete existing lessons for idempotency
	await db.delete(schema.lessons);
	console.log('Cleared existing lessons.');

	// Insert lessons
	const rows = lessonData.map((lesson) => ({
		id: ulid(),
		partNumber: lesson.partNumber,
		title: lesson.title,
		slug: lesson.slug,
		podcastUrl: `/audio/${String(lesson.partNumber).padStart(2, '0')}-${lesson.slug}.mp3`,
		transcript: '',
		puzzlePosition: lesson.puzzlePosition
	}));

	await db.insert(schema.lessons).values(rows);
	console.log(`Inserted ${rows.length} lessons.`);

	console.log('Seed complete.');
	client.close();
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	client.close();
	process.exit(1);
});
