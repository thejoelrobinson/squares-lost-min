import { eq, and, asc } from 'drizzle-orm';
import { db } from './index';
import { users, lessons, lessonProgress, conversations } from './schema';

// ── Users ──────────────────────────────────────────────────────────

export async function getFirstUser() {
	const rows = await db.select().from(users).limit(1);
	return rows[0] ?? null;
}

export async function getUserById(id: string) {
	const rows = await db.select().from(users).where(eq(users.id, id));
	return rows[0] ?? null;
}

export async function createUser(data: typeof users.$inferInsert) {
	const rows = await db.insert(users).values(data).returning();
	return rows[0];
}

export async function updateUser(id: string, data: Partial<Omit<typeof users.$inferInsert, 'id'>>) {
	const rows = await db
		.update(users)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning();
	return rows[0] ?? null;
}

// ── Lessons ────────────────────────────────────────────────────────

export async function getAllLessons() {
	return db.select().from(lessons).orderBy(asc(lessons.partNumber));
}

export async function getLessonBySlug(slug: string) {
	const rows = await db.select().from(lessons).where(eq(lessons.slug, slug));
	return rows[0] ?? null;
}

// ── Lesson Progress ────────────────────────────────────────────────

export async function getProgressForUser(userId: string) {
	return db
		.select()
		.from(lessonProgress)
		.innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
		.where(eq(lessonProgress.userId, userId))
		.orderBy(asc(lessons.partNumber));
}

export async function getLessonProgress(userId: string, lessonId: string) {
	const rows = await db
		.select()
		.from(lessonProgress)
		.where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
	return rows[0] ?? null;
}

export async function updateLessonProgress(
	id: string,
	data: Partial<Omit<typeof lessonProgress.$inferInsert, 'id'>>
) {
	const rows = await db
		.update(lessonProgress)
		.set(data)
		.where(eq(lessonProgress.id, id))
		.returning();
	return rows[0] ?? null;
}

export async function createLessonProgress(data: typeof lessonProgress.$inferInsert) {
	const rows = await db.insert(lessonProgress).values(data).returning();
	return rows[0];
}

// ── Conversations ──────────────────────────────────────────────────

export async function createConversation(data: typeof conversations.$inferInsert) {
	const rows = await db.insert(conversations).values(data).returning();
	return rows[0];
}
