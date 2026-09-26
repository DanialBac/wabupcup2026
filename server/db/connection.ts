import mysql, { Pool, PoolConnection, PoolOptions } from 'mysql2/promise';

let pool: Pool | null = null;

export interface TiDbConfig {
  databaseUrl?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

/**
 * Resolves SSL configuration for TiDB Cloud and managed MySQL services.
 * TiDB Cloud mandates TLS 1.2+ encryption.
 */
function resolveTiDbSsl(hostOrUrl?: string): any {
  // If explicitly disabled via env
  if (process.env.MYSQL_SSL === 'false' || process.env.MYSQL_SSL === '0') {
    return undefined;
  }

  // TiDB Cloud and modern cloud databases require TLSv1.2+
  return {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === 'true',
  };
}

/**
 * Returns a centralized, connection-pooled MySQL/TiDB client.
 * Configured with strict connectionLimit to prevent quota exhaustion on TiDB Cloud Free Tier
 * during massive concurrent serverless lambdas.
 */
export function getDbPool(customConfig?: TiDbConfig): Pool {
  if (pool && !customConfig) {
    return pool;
  }

  const dbUrl = (customConfig?.databaseUrl || process.env.DATABASE_URL || '').trim();
  const host = (customConfig?.host || process.env.TIDB_HOST || process.env.MYSQL_HOST || '').trim();
  const rawPort = customConfig?.port || process.env.TIDB_PORT || process.env.MYSQL_PORT || '4000';
  const port = parseInt(String(rawPort), 10);
  const user = (customConfig?.user || process.env.TIDB_USER || process.env.MYSQL_USER || '').trim();
  const password = customConfig?.password !== undefined ? customConfig.password : (process.env.TIDB_PASSWORD || process.env.MYSQL_PASSWORD || '');
  const database = (customConfig?.database || process.env.TIDB_DATABASE || process.env.MYSQL_DATABASE || 'wabupcup_db').trim();

  let poolOptions: PoolOptions;

  if (dbUrl) {
    try {
      const parsedUrl = new URL(dbUrl);
      const urlDbName = parsedUrl.pathname.replace(/^\/+/, '') || database;
      const urlPort = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 4000;
      
      poolOptions = {
        host: parsedUrl.hostname,
        port: urlPort,
        user: decodeURIComponent(parsedUrl.username),
        password: decodeURIComponent(parsedUrl.password),
        database: urlDbName,
        // Free-tier safety: maximum 4 connections per lambda container
        connectionLimit: 4,
        maxIdle: 2,
        idleTimeout: 30000,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        connectTimeout: 5000,
        ssl: resolveTiDbSsl(parsedUrl.hostname),
      };
    } catch {
      poolOptions = {
        uri: dbUrl,
        connectionLimit: 4,
        maxIdle: 2,
        idleTimeout: 30000,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        connectTimeout: 5000,
        ssl: resolveTiDbSsl(dbUrl),
      };
    }
  } else {
    poolOptions = {
      host: host || 'localhost',
      port: port || 4000,
      user: user || 'root',
      password: password || '',
      database: database || 'wabupcup_db',
      connectionLimit: 4,
      maxIdle: 2,
      idleTimeout: 30000,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 5000,
      ssl: host ? resolveTiDbSsl(host) : undefined,
    };
  }

  // Gracefully close any existing pool if reconfiguring
  if (pool) {
    try {
      pool.end().catch(() => {});
    } catch {}
  }

  pool = mysql.createPool(poolOptions);

  (pool as any).on?.('error', (err: any) => {
    console.warn('[TiDB Pool Warning]', err?.message || err);
  });

  return pool;
}

/**
 * Execute parameterized query with automatic connection management.
 * Guarantees prepared statement usage.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const p = getDbPool();
  const [results] = await p.execute(sql, params);
  return results as T;
}

/**
 * Execute transaction securely with automatic rollback on error.
 */
export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const p = getDbPool();
  const connection = await p.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
