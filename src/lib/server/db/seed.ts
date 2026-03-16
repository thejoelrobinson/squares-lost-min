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
		title: 'The Psychology and Perception of Feedback',
		slug: 'why-feedback-matters',
		puzzlePosition: 'top-left'
	},
	{
		partNumber: 3,
		title: 'The Chronology and Purpose of Intervention',
		slug: 'sbi-framework',
		puzzlePosition: 'top-center'
	},
	{
		partNumber: 4,
		title: 'The SBI Structural Model',
		slug: 'timing-is-everything',
		puzzlePosition: 'top-right'
	},
	{ partNumber: 5, title: 'Test 1', slug: 'test-1', puzzlePosition: null },
	{
		partNumber: 6,
		title: 'Transforming Delivery into Dialogue (The SBI-N Model)',
		slug: 'reading-the-room',
		puzzlePosition: 'middle-left'
	},
	{
		partNumber: 7,
		title: 'Real-World Case Studies and Scenarios',
		slug: 'being-specific',
		puzzlePosition: 'center'
	},
	{
		partNumber: 8,
		title: 'Navigating Cognitive Resistance (The 4 Ds)',
		slug: 'hard-conversations',
		puzzlePosition: 'middle-right'
	},
	{ partNumber: 9, title: 'Test 2', slug: 'test-2', puzzlePosition: null },
	{
		partNumber: 10,
		title: 'Advanced Tactics for Guiding Difficult Conversations',
		slug: 'listening-after-you-speak',
		puzzlePosition: 'bottom-left'
	},
	{ partNumber: 11, title: 'Final Test', slug: 'final-test', puzzlePosition: null }
];

async function seed() {
	console.log(`Seeding database at: ${DATABASE_URL}`);

	// Delete existing data for idempotency (child tables first due to FK constraints)
	await db.delete(schema.conversations);
	await db.delete(schema.lessonProgress);
	await db.delete(schema.lessons);
	console.log('Cleared existing data.');

	// Insert lessons
	const rows = lessonData.map((lesson) => ({
		id: ulid(),
		partNumber: lesson.partNumber,
		title: lesson.title,
		slug: lesson.slug,
		podcastUrl: `/audio/${String(lesson.partNumber).padStart(2, '0')}-${lesson.slug}/podcast.mp3`,
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
