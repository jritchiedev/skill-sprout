import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

// The in-flight promise is cached, not the resolved handle: callers race each
// other on startup, and two of them opening the database would run the
// migrations twice, concurrently.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase().catch((error) => {
      dbPromise = null; // let a later call retry instead of caching the failure
      throw error;
    });
  }
  return dbPromise;
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync('pencilbox.db');
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await runMigrations(database);
  await database.execAsync('PRAGMA foreign_keys = ON;');
  return database;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(
    'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);'
  );

  const result = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );
  const currentVersion = result?.version ?? 0;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);
  if (pending.length === 0) return;

  // Migrations that rebuild a table need foreign keys off, and the pragma is a
  // no-op inside a transaction -- so it has to be toggled around the whole batch.
  await database.execAsync('PRAGMA foreign_keys = OFF;');
  try {
    for (const migration of pending) {
      await database.withTransactionAsync(async () => {
        for (const statement of migration.statements) {
          await database.execAsync(statement);
        }
        await database.runAsync('DELETE FROM schema_version');
        await database.runAsync('INSERT INTO schema_version (version) VALUES (?)', [
          migration.version,
        ]);
      });
    }
  } finally {
    await database.execAsync('PRAGMA foreign_keys = ON;');
  }
}

export async function closeDatabase(): Promise<void> {
  if (!dbPromise) return;
  const database = await dbPromise;
  dbPromise = null;
  await database.closeAsync();
}
