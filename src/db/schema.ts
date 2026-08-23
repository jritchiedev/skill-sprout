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
      `CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER NOT NULL
      );`,
      `INSERT INTO schema_version (version) VALUES (1);`,
    ],
  },
];
