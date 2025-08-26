import Database from "better-sqlite3";
import { DateTime } from "luxon";
import { SF_TZ } from "@/constant.js";

let db: Database.Database | null = null;

export interface Reminder {
  id: number;
  inboxId: string;
  conversationId: string; // Add conversation ID to fix privacy issue
  targetTime: string; // ISO string
  message: string;
  sent: boolean;
  createdAt: string; // ISO string
}

export function openRemindersDb(dbPath: string): void {
  db = Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inboxId TEXT NOT NULL,
      conversationId TEXT NOT NULL,
      targetTime TEXT NOT NULL,
      message TEXT NOT NULL,
      sent INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add conversationId column if it doesn't exist
  try {
    db.exec(`ALTER TABLE reminders ADD COLUMN conversationId TEXT`);
    // Set default conversationId for existing reminders (they'll be sent to the first available conversation)
    db.exec(`UPDATE reminders SET conversationId = 'legacy' WHERE conversationId IS NULL`);
  } catch (error) {
    // Column already exists, ignore error
  }
}

export function insertReminder(
  inboxId: string,
  conversationId: string,
  targetTime: string,
  message: string,
): number {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare(`
    INSERT INTO reminders (inboxId, conversationId, targetTime, message)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(inboxId, conversationId, targetTime, message);
  return result.lastInsertRowid as number;
}

export function listPendingReminders(): Reminder[] {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare(`
    SELECT * FROM reminders 
    WHERE sent = 0 
    ORDER BY targetTime ASC
  `);

  return stmt.all() as Reminder[];
}

export function listAllPendingForInbox(inboxId: string): Reminder[] {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare(`
    SELECT * FROM reminders 
    WHERE inboxId = ? AND sent = 0 
    ORDER BY targetTime ASC
  `);

  return stmt.all(inboxId) as Reminder[];
}

export function markReminderSent(id: number): void {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare(`
    UPDATE reminders SET sent = 1 WHERE id = ?
  `);

  stmt.run(id);
}

export function cancelReminder(id: number): boolean {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare(`
    DELETE FROM reminders WHERE id = ?
  `);

  const result = stmt.run(id);
  return result.changes > 0;
}

export function cancelAllRemindersForInbox(inboxId: string): number {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare(`
    DELETE FROM reminders WHERE inboxId = ? AND sent = 0
  `);

  const result = stmt.run(inboxId);
  return result.changes;
}

export function getDueReminders(): Reminder[] {
  if (!db) throw new Error("Database not initialized");

  const now = DateTime.now().setZone(SF_TZ);

  const stmt = db.prepare(`
    SELECT * FROM reminders 
    WHERE sent = 0 AND targetTime <= ?
    ORDER BY targetTime ASC
  `);

  return stmt.all(now.toISO()) as Reminder[];
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
