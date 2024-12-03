import { Database } from 'sqlite3'

export async function up(db: Database): Promise<void> {
  // Users table for authentication
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `)

  // Endpoints table (existing, but with additional fields)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS endpoints (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      isActive BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_health_check DATETIME,
      health_status TEXT,
      metadata TEXT
    )
  `)

  // DAG runs for caching and history
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dag_runs (
      id TEXT PRIMARY KEY,
      endpoint_id TEXT NOT NULL,
      dag_id TEXT NOT NULL,
      run_id TEXT NOT NULL,
      state TEXT NOT NULL,
      start_date DATETIME,
      end_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
    )
  `)

  // System logs
  await db.exec(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create indexes
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dag_runs_endpoint_id ON dag_runs(endpoint_id);
    CREATE INDEX IF NOT EXISTS idx_dag_runs_dag_id ON dag_runs(dag_id);
    CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
    CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
  `)
}

export async function down(db: Database): Promise<void> {
  await db.exec(`
    DROP TABLE IF EXISTS system_logs;
    DROP TABLE IF EXISTS dag_runs;
    DROP TABLE IF EXISTS endpoints;
    DROP TABLE IF EXISTS users;
  `)
}
