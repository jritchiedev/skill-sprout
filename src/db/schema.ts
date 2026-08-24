export const MIGRATIONS = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        avatar_color TEXT NOT NULL DEFAULT '#3B82F6',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
      `CREATE TABLE IF NOT EXISTS passages (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        word_count INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
      `CREATE TABLE IF NOT EXISTS reading_attempts (
        id TEXT PRIMARY KEY NOT NULL,
        student_id TEXT,
        passage_id TEXT,
        passage_title_snapshot TEXT NOT NULL DEFAULT '',
        total_words INTEGER NOT NULL,
        elapsed_milliseconds INTEGER NOT NULL,
        error_count INTEGER NOT NULL DEFAULT 0,
        words_correct INTEGER NOT NULL,
        wpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
        FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
      );`,
      `CREATE TABLE IF NOT EXISTS error_events (
        id TEXT PRIMARY KEY NOT NULL,
        reading_attempt_id TEXT NOT NULL,
        elapsed_milliseconds INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (reading_attempt_id) REFERENCES reading_attempts(id) ON DELETE CASCADE
      );`,
    ],
  },
  {
    // Reading attempts used to survive their student via ON DELETE SET NULL,
    // which left orphaned rows in History with no student to attribute them to.
    // A student's attempts are now deleted along with the student. SQLite cannot
    // alter a foreign key in place, so the table is rebuilt.
    version: 2,
    statements: [
      `CREATE TABLE reading_attempts_v2 (
        id TEXT PRIMARY KEY NOT NULL,
        student_id TEXT,
        passage_id TEXT,
        passage_title_snapshot TEXT NOT NULL DEFAULT '',
        total_words INTEGER NOT NULL,
        elapsed_milliseconds INTEGER NOT NULL,
        error_count INTEGER NOT NULL DEFAULT 0,
        words_correct INTEGER NOT NULL,
        wpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
      );`,
      `INSERT INTO reading_attempts_v2
       SELECT id, student_id, passage_id, passage_title_snapshot, total_words,
              elapsed_milliseconds, error_count, words_correct, wpm, accuracy,
              started_at, completed_at, created_at, updated_at
       FROM reading_attempts;`,
      // Attempts orphaned by a student deleted under the old SET NULL rule.
      `DELETE FROM reading_attempts_v2 WHERE student_id IS NULL;`,
      `DROP TABLE reading_attempts;`,
      `ALTER TABLE reading_attempts_v2 RENAME TO reading_attempts;`,
      // error_events rows whose attempt was just removed.
      `DELETE FROM error_events
       WHERE reading_attempt_id NOT IN (SELECT id FROM reading_attempts);`,
    ],
  },
];
