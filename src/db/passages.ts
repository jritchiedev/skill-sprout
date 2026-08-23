import { getDatabase } from './database';
import { Passage } from '@/src/types/models';
import { generateId } from '@/src/utils/uuid';

function mapRow(row: any): Passage {
  return {
    id: row.id,
    title: row.title,
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllPassages(): Promise<Passage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM passages ORDER BY title ASC');
  return rows.map(mapRow);
}

export async function getPassageById(id: string): Promise<Passage | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM passages WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
}

export async function createPassage(title: string, wordCount: number): Promise<Passage> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO passages (id, title, word_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, title.trim(), wordCount, now, now]
  );
  return { id, title: title.trim(), wordCount, createdAt: now, updatedAt: now };
}

export async function updatePassage(id: string, title: string, wordCount: number): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE passages SET title = ?, word_count = ?, updated_at = ? WHERE id = ?',
    [title.trim(), wordCount, now, id]
  );
}

export async function deletePassage(id: string): Promise<{ blocked: boolean }> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reading_attempts WHERE passage_id = ?',
    [id]
  );
  if (result && result.count > 0) {
    return { blocked: true };
  }
  await db.runAsync('DELETE FROM passages WHERE id = ?', [id]);
  return { blocked: false };
}
