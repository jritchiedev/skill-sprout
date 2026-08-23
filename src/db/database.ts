import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('pencilbox.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  let currentVersion = 0;
  try {
    const result = await database.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version LIMIT 1'
    );
    if (result) {
      currentVersion = result.version;
    }
  } catch {
    currentVersion = 0;
  }

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      for (const statement of migration.statements) {
        await database.execAsync(statement);
      }
    }
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
