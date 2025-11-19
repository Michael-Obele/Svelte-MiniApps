import { query, command, form } from '$app/server';
import { prisma } from '$lib/server/db';
import { getCurrentUser } from './auth.remote';
import * as v from 'valibot';

// Types
interface Note {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

// Schemas
const NoteSchema = v.object({
	id: v.string(),
	title: v.string(),
	content: v.string(),
	createdAt: v.string(),
	updatedAt: v.string()
});

const BackupDataSchema = v.object({
	notes: v.array(NoteSchema)
});

// Queries
export const getNotes = query(async () => {
	const user = await getCurrentUser();
	if (!user) throw new Error('User not authenticated');

	const notes = await prisma.note.findMany({
		where: { userId: user.id },
		orderBy: { updatedAt: 'desc' }
	});

	return notes.map((note) => ({
		id: note.id,
		title: note.title,
		content: note.content,
		createdAt: note.createdAt.toISOString(),
		updatedAt: note.updatedAt.toISOString()
	}));
});

// Forms
export const createNoteForm = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty('Title is required')),
		content: v.string()
	}),
	async (data) => {
		const user = await getCurrentUser();
		if (!user) throw new Error('User not authenticated');

		const note = await prisma.note.create({
			data: {
				id: crypto.randomUUID(),
				userId: user.id,
				title: data.title,
				content: data.content
			}
		});

		await getNotes().refresh();

		return {
			success: true,
			note: {
				id: note.id,
				title: note.title,
				content: note.content,
				createdAt: note.createdAt.toISOString(),
				updatedAt: note.updatedAt.toISOString()
			}
		};
	}
);

export const updateNoteForm = form(
	v.object({
		id: v.string(),
		title: v.pipe(v.string(), v.nonEmpty('Title is required')),
		content: v.string()
	}),
	async (data) => {
		const user = await getCurrentUser();
		if (!user) throw new Error('User not authenticated');

		const existingNote = await prisma.note.findFirst({
			where: { id: data.id, userId: user.id }
		});

		if (!existingNote) throw new Error('Note not found');

		const note = await prisma.note.update({
			where: { id: data.id },
			data: {
				title: data.title,
				content: data.content
			}
		});

		await getNotes().refresh();

		return {
			success: true,
			note: {
				id: note.id,
				title: note.title,
				content: note.content,
				createdAt: note.createdAt.toISOString(),
				updatedAt: note.updatedAt.toISOString()
			}
		};
	}
);

// Commands
export const deleteNote = command(v.string(), async (id) => {
	const user = await getCurrentUser();
	if (!user) throw new Error('User not authenticated');

	await prisma.note.deleteMany({
		where: { id, userId: user.id }
	});

	return { success: true, id };
});

export const syncNoteData = command(BackupDataSchema, async (localData) => {
	const user = await getCurrentUser();
	if (!user) throw new Error('User not authenticated');

	const serverNotes = await prisma.note.findMany({
		where: { userId: user.id }
	});

	const mergedNotes = new Map<string, Note>();

	serverNotes.forEach((note) => {
		mergedNotes.set(note.id, {
			id: note.id,
			title: note.title,
			content: note.content,
			createdAt: note.createdAt.toISOString(),
			updatedAt: note.updatedAt.toISOString()
		});
	});

	localData.notes.forEach((note) => {
		const existing = mergedNotes.get(note.id);
		if (!existing || new Date(note.updatedAt) > new Date(existing.updatedAt)) {
			mergedNotes.set(note.id, note);
		}
	});

	const finalNotes = Array.from(mergedNotes.values());

	await prisma.note.deleteMany({ where: { userId: user.id } });

	if (finalNotes.length > 0) {
		await prisma.note.createMany({
			data: finalNotes.map((note) => ({
				id: note.id,
				userId: user.id,
				title: note.title,
				content: note.content,
				createdAt: new Date(note.createdAt),
				updatedAt: new Date(note.updatedAt)
			}))
		});
	}

	return {
		success: true,
		notes: finalNotes
	};
});
