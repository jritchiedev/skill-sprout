import { getDatabase } from './database';
import { Student } from '@/src/types/models';
import { generateId } from '@/src/utils/uuid';
import { avatarColors } from '@/src/theme';

function mapRow(row: any): Student {
  return {
    id: row.id,
    name: row.name,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllStudents(): Promise<Student[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM students ORDER BY name ASC');
  return rows.map(mapRow);
}

export async function getStudentById(id: string): Promise<Student | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM students WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
}

export async function createStudent(name: string): Promise<Student> {
  const db = await getDatabase();
  const id = generateId();
  const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO students (id, name, avatar_color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, name.trim(), color, now, now]
  );
  return { id, name: name.trim(), avatarColor: color, createdAt: now, updatedAt: now };
}

export async function updateStudent(id: string, name: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE students SET name = ?, updated_at = ? WHERE id = ?',
    [name.trim(), now, id]
  );
}

/**
 * Deletes a student along with every reading attempt recorded for them, and the
 * error events belonging to those attempts. Both are removed by the ON DELETE
 * CASCADE chain in the schema, which requires `PRAGMA foreign_keys = ON`.
 */
export async function deleteStudent(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM students WHERE id = ?', [id]);
}

export async function getStudentAttemptCount(studentId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reading_attempts WHERE student_id = ?',
    [studentId]
  );
  return result?.count ?? 0;
}
