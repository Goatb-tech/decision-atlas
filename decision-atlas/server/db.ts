import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const databasePath = process.env.SQLITE_PATH ?? path.join(dataDir, "decision-atlas.sqlite");

fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scenarios (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL DEFAULT '',
    horizon TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    current_leaning TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS scenario_options (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    label TEXT NOT NULL,
    thesis TEXT NOT NULL DEFAULT '',
    upside TEXT NOT NULL DEFAULT '',
    downside TEXT NOT NULL DEFAULT '',
    reversibility TEXT NOT NULL DEFAULT '',
    time_to_results TEXT NOT NULL DEFAULT '',
    effort_cost TEXT NOT NULL DEFAULT '',
    confidence INTEGER NOT NULL DEFAULT 50,
    position INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS scenario_snapshots (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS snapshot_scores (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL,
    option_id TEXT,
    option_label TEXT NOT NULL,
    thesis TEXT NOT NULL DEFAULT '',
    upside TEXT NOT NULL DEFAULT '',
    downside TEXT NOT NULL DEFAULT '',
    reversibility TEXT NOT NULL DEFAULT '',
    time_to_results TEXT NOT NULL DEFAULT '',
    effort_cost TEXT NOT NULL DEFAULT '',
    confidence INTEGER NOT NULL DEFAULT 50,
    position INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (snapshot_id) REFERENCES scenario_snapshots(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reflection_entries (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    body TEXT NOT NULL,
    learned TEXT NOT NULL DEFAULT '',
    leaning TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
  );
`);

export function createId() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}
