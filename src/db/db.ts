import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync("flow-journal.db");
  }
  return db;
}

export function initDatabase(): void {
  const database = getDatabase();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      total_volume REAL DEFAULT 0,
      duration INTEGER DEFAULT 0
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL,
      weight REAL DEFAULT 0,
      reps INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      timestamp TEXT,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
  `);

  // Add notes column to workouts (for existing installs)
  try {
    database.execSync(`ALTER TABLE workouts ADD COLUMN notes TEXT DEFAULT ''`);
  } catch {
    // Column already exists — ignore
  }

  database.execSync(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      notes TEXT DEFAULT ''
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS template_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      muscle_group TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );
  `);

  // Custom exercises table
  database.execSync(`
    CREATE TABLE IF NOT EXISTS custom_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      muscle_group TEXT NOT NULL,
      metric_type TEXT NOT NULL DEFAULT 'weight_reps',
      is_bodyweight INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Add metric columns to exercises table
  try {
    database.execSync(`ALTER TABLE exercises ADD COLUMN metric_type TEXT DEFAULT 'weight_reps'`);
  } catch {
    // Column already exists
  }
  try {
    database.execSync(`ALTER TABLE exercises ADD COLUMN superset_group INTEGER DEFAULT NULL`);
  } catch {
    // Column already exists
  }
  try {
    database.execSync(`ALTER TABLE exercises ADD COLUMN unit TEXT DEFAULT 'lbs'`);
  } catch {
    // Column already exists
  }

  // Add value column to sets table (for distance/time metrics)
  try {
    database.execSync(`ALTER TABLE sets ADD COLUMN value REAL DEFAULT 0`);
  } catch {
    // Column already exists
  }

  // Add metric columns to template_exercises table
  try {
    database.execSync(`ALTER TABLE template_exercises ADD COLUMN metric_type TEXT DEFAULT 'weight_reps'`);
  } catch {
    // Column already exists
  }
  try {
    database.execSync(`ALTER TABLE template_exercises ADD COLUMN superset_group INTEGER DEFAULT NULL`);
  } catch {
    // Column already exists
  }

  console.log("Database initialized with tables: workouts, exercises, sets, templates, template_exercises, custom_exercises");
}
