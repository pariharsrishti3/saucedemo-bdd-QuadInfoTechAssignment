import { Pool, QueryResultRow } from 'pg';
import { config } from '../config/environment';
import { log } from './logger';
export class Database {
  private readonly pool: Pool;
  constructor(connectionString = config.databaseURL) {
    if (!connectionString) throw new Error('DATABASE_URL is required for DB validation');
    this.pool = new Pool({ connectionString, max: 2, connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000, query_timeout: 5000, statement_timeout: 5000,
      ssl: config.dbSSL ? { rejectUnauthorized: true } : false });
    this.pool.on('error', () => log('DB idle connection error; check database availability.'));
  }
  async query<T extends QueryResultRow>(sql: string, values: unknown[] = []): Promise<T[]> {
    try { return (await this.pool.query<T>(sql, values)).rows; }
    catch (error) {
      // Do not expose SQL parameters or connection strings in failure output.
      const code = (error as { code?: string }).code ?? 'UNKNOWN';
      throw new Error(`Database query failed (${code})`);
    }
  }
  async close(): Promise<void> { await this.pool.end(); }
}
