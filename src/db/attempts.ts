import { getDatabase } from './database';
import { ReadingAttempt } from '@/src/types/models';
import { generateId } from '@/src/utils/uuid';

function mapAttemptRow(row: any): ReadingAttempt {
  return {
    id: row.id,
    studentId: row.student_id,
    passageId: row.passage_id,
    passageTitleSnapshot: row.passage_title_snapshot,
    totalWords: row.total_words,
    elapsedMilliseconds: row.elapsed_milliseconds,
    errorCount: row.error_count,
    wordsCorrect: row.words_correct,
    wpm: row.wpm,
    accuracy: row.accuracy,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveReadingAttempt(
  attempt: Omit<ReadingAttempt, 'createdAt' | 'updatedAt'>,
  errorEvents: { elapsedMilliseconds: number }[]
): Promise<ReadingAttempt> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  // The attempt and its error events are one record -- never save half of it.
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO reading_attempts
       (id, student_id, passage_id, passage_title_snapshot, total_words, elapsed_milliseconds,
        error_count, words_correct, wpm, accuracy, started_at, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attempt.id,
        attempt.studentId,
        attempt.passageId,
        attempt.passageTitleSnapshot,
        attempt.totalWords,
        attempt.elapsedMilliseconds,
        attempt.errorCount,
        attempt.wordsCorrect,
        attempt.wpm,
        attempt.accuracy,
        attempt.startedAt,
        attempt.completedAt,
        now,
        now,
      ]
    );

    for (const event of errorEvents) {
      await db.runAsync(
        'INSERT INTO error_events (id, reading_attempt_id, elapsed_milliseconds, created_at) VALUES (?, ?, ?, ?)',
        [generateId(), attempt.id, event.elapsedMilliseconds, now]
      );
    }
  });

  return { ...attempt, createdAt: now, updatedAt: now };
}

export async function getAttemptsByStudent(studentId: string): Promise<ReadingAttempt[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM reading_attempts WHERE student_id = ? ORDER BY completed_at DESC',
    [studentId]
  );
  return rows.map(mapAttemptRow);
}

export async function getAttemptsByPassage(
  studentId: string,
  passageId: string
): Promise<ReadingAttempt[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM reading_attempts WHERE student_id = ? AND passage_id = ? ORDER BY completed_at ASC',
    [studentId, passageId]
  );
  return rows.map(mapAttemptRow);
}

export async function getAllAttempts(): Promise<ReadingAttempt[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM reading_attempts ORDER BY completed_at DESC'
  );
  return rows.map(mapAttemptRow);
}

export async function getRecentAttempts(limit: number = 20): Promise<ReadingAttempt[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM reading_attempts ORDER BY completed_at DESC LIMIT ?',
    [limit]
  );
  return rows.map(mapAttemptRow);
}

/** Deletes an attempt; its error events go with it via ON DELETE CASCADE. */
export async function deleteAttempt(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM reading_attempts WHERE id = ?', [id]);
}

export interface StudentPassageStats {
  passageId: string | null;
  passageTitle: string;
  attemptCount: number;
  latestWpm: number;
  bestWpm: number;
  firstWpm: number;
}

export async function getStudentPassageStats(studentId: string): Promise<StudentPassageStats[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT
       passage_id,
       passage_title_snapshot,
       COUNT(*) as attempt_count,
       MAX(wpm) as best_wpm
     FROM reading_attempts
     WHERE student_id = ?
     GROUP BY COALESCE(passage_id, id), passage_title_snapshot
     ORDER BY MAX(completed_at) DESC`,
    [studentId]
  );

  const stats: StudentPassageStats[] = [];
  for (const row of rows) {
    const attempts = await db.getAllAsync<any>(
      `SELECT wpm FROM reading_attempts
       WHERE student_id = ? AND (passage_id = ? OR (passage_id IS NULL AND passage_title_snapshot = ?))
       ORDER BY completed_at ASC`,
      [studentId, row.passage_id, row.passage_title_snapshot]
    );
    const wpmValues = attempts.map((a: any) => a.wpm);
    stats.push({
      passageId: row.passage_id,
      passageTitle: row.passage_title_snapshot,
      attemptCount: row.attempt_count,
      latestWpm: wpmValues[wpmValues.length - 1] ?? 0,
      bestWpm: row.best_wpm,
      firstWpm: wpmValues[0] ?? 0,
    });
  }
  return stats;
}
