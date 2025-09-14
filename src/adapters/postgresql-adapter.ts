import { Pool, PoolClient, QueryResult as PGQueryResult } from 'pg';
import { BaseDatabaseAdapter } from './base-database-adapter.js';
import { QueryResult, TableInfo, DatabaseStats, ColumnInfo, IndexInfo, ConstraintInfo } from '../types/database.js';

export class PostgreSQLAdapter extends BaseDatabaseAdapter {
  private pool: Pool | null = null;
  private client: PoolClient | null = null;
  private transactionClient: PoolClient | null = null;

  async connect(): Promise<void> {
    try {
      const connectionConfig = {
        host: this.config.host || 'localhost',
        port: this.config.port || 5432,
        database: this.config.database || 'postgres',
        user: this.config.username || 'postgres',
        password: this.config.password || '',
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      this.pool = new Pool(connectionConfig);
      this.client = await this.pool.connect();
      this.connected = true;
    } catch (error) {
      this.connected = false;
      throw this.handleError(error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.transactionClient) {
        await this.transactionClient.release();
        this.transactionClient = null;
      }
      if (this.client) {
        this.client.release();
        this.client = null;
      }
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }
      this.connected = false;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  isConnected(): boolean {
    return this.connected && this.pool !== null;
  }

  async executeQuery(query: string, parameters?: unknown[]): Promise<QueryResult> {
    const client = this.transactionClient || this.client;
    if (!client) {
      throw new Error('Database not connected');
    }

    const result: PGQueryResult = await client.query(query, parameters);
    
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
      fields: result.fields.map(field => ({
        name: field.name,
        dataType: field.dataTypeID.toString(),
        nullable: true, // PostgreSQL FieldDef doesn't have notNull property
        defaultValue: undefined, // PostgreSQL FieldDef doesn't have defaultValue property
      })),
    };
  }

  async getTables(): Promise<TableInfo[]> {
    const query = `
      SELECT 
        t.table_name,
        t.table_schema,
        CASE 
          WHEN t.table_type = 'BASE TABLE' THEN 'table'
          WHEN t.table_type = 'VIEW' THEN 'view'
          WHEN t.table_type = 'MATERIALIZED VIEW' THEN 'materialized_view'
          ELSE 'table'
        END as table_type
      FROM information_schema.tables t
      WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY t.table_schema, t.table_name
    `;

    const result = await this.executeQuery(query);
    const tables: TableInfo[] = [];

    for (const row of result.rows) {
      const tableInfo = await this.getTableInfo(row.table_name as string, row.table_schema as string);
      if (tableInfo) {
        tables.push(tableInfo);
      }
    }

    return tables;
  }

  async getTableInfo(tableName: string, schema?: string): Promise<TableInfo | null> {
    const schemaName = schema || 'public';
    
    // Get table info
    const tableQuery = `
      SELECT 
        t.table_name,
        t.table_schema,
        CASE 
          WHEN t.table_type = 'BASE TABLE' THEN 'table'
          WHEN t.table_type = 'VIEW' THEN 'view'
          WHEN t.table_type = 'MATERIALIZED VIEW' THEN 'materialized_view'
          ELSE 'table'
        END as table_type
      FROM information_schema.tables t
      WHERE t.table_name = $1 AND t.table_schema = $2
    `;

    const tableResult = await this.executeQuery(tableQuery, [tableName, schemaName]);
    if (tableResult.rows.length === 0) {
      return null;
    }

    const table = tableResult.rows[0];

    // Get columns
    const columnsQuery = `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
        WHERE tc.table_name = $1 AND tc.table_schema = $2 AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
        WHERE tc.table_name = $1 AND tc.table_schema = $2 AND tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.column_name = fk.column_name
      WHERE c.table_name = $1 AND c.table_schema = $2
      ORDER BY c.ordinal_position
    `;

    const columnsResult = await this.executeQuery(columnsQuery, [tableName, schemaName]);
    const columns: ColumnInfo[] = columnsResult.rows.map(row => ({
      name: row.column_name as string,
      dataType: row.data_type as string,
      nullable: row.is_nullable === 'YES',
      defaultValue: row.column_default,
      isPrimaryKey: row.is_primary_key as boolean,
      isForeignKey: row.is_foreign_key as boolean,
      maxLength: row.character_maximum_length as number,
      precision: row.numeric_precision as number,
      scale: row.numeric_scale as number,
    }));

    // Get indexes
    const indexesQuery = `
      SELECT 
        i.indexname as name,
        array_agg(a.attname ORDER BY a.attnum) as columns,
        i.indexdef LIKE '%UNIQUE%' as unique,
        i.indexdef as type
      FROM pg_indexes i
      JOIN pg_class c ON c.relname = i.indexname
      JOIN pg_index ix ON ix.indexrelid = c.oid
      JOIN pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = ANY(ix.indkey)
      WHERE i.tablename = $1 AND i.schemaname = $2
      GROUP BY i.indexname, i.indexdef
    `;

    const indexesResult = await this.executeQuery(indexesQuery, [tableName, schemaName]);
    const indexes: IndexInfo[] = indexesResult.rows.map(row => ({
      name: row.name as string,
      columns: row.columns as string[],
      unique: row.unique as boolean,
      type: row.type as string,
    }));

    // Get constraints
    const constraintsQuery = `
      SELECT 
        tc.constraint_name as name,
        tc.constraint_type as type,
        array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns,
        ccu.table_name as referenced_table,
        array_agg(ccu.column_name ORDER BY kcu.ordinal_position) as referenced_columns
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = $1 AND tc.table_schema = $2
      GROUP BY tc.constraint_name, tc.constraint_type, ccu.table_name
    `;

    const constraintsResult = await this.executeQuery(constraintsQuery, [tableName, schemaName]);
    const constraints: ConstraintInfo[] = constraintsResult.rows.map(row => ({
      name: row.name as string,
      type: (row.type as string) as 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK' | 'NOT NULL',
      columns: row.columns as string[],
      referencedTable: row.referenced_table as string,
      referencedColumns: row.referenced_columns as string[],
    }));

    return {
      name: (table?.table_name as string) || '',
      schema: (table?.table_schema as string) || '',
      type: (table?.table_type as 'table' | 'view' | 'materialized_view') || 'table',
      columns,
      indexes,
      constraints,
    };
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    const tablesQuery = `
      SELECT COUNT(*) as total_tables
      FROM information_schema.tables
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `;

    const viewsQuery = `
      SELECT COUNT(*) as total_views
      FROM information_schema.views
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `;

    const indexesQuery = `
      SELECT COUNT(*) as total_indexes
      FROM pg_indexes
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
    `;

    const sizeQuery = `
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
    `;

    const connectionsQuery = `
      SELECT COUNT(*) as connection_count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    const [tablesResult, viewsResult, indexesResult, sizeResult, connectionsResult] = await Promise.all([
      this.executeQuery(tablesQuery),
      this.executeQuery(viewsQuery),
      this.executeQuery(indexesQuery),
      this.executeQuery(sizeQuery),
      this.executeQuery(connectionsQuery),
    ]);

    return {
      totalTables: parseInt((tablesResult.rows[0]?.total_tables as string) || '0'),
      totalViews: parseInt((viewsResult.rows[0]?.total_views as string) || '0'),
      totalIndexes: parseInt((indexesResult.rows[0]?.total_indexes as string) || '0'),
      databaseSize: (sizeResult.rows[0]?.database_size as string) || '0 MB',
      connectionCount: parseInt((connectionsResult.rows[0]?.connection_count as string) || '0'),
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async beginTransaction(): Promise<void> {
    if (this.transactionClient) {
      throw new Error('Transaction already in progress');
    }
    
    this.transactionClient = await this.pool!.connect();
    await this.transactionClient.query('BEGIN');
  }

  async commitTransaction(): Promise<void> {
    if (!this.transactionClient) {
      throw new Error('No transaction in progress');
    }
    
    await this.transactionClient.query('COMMIT');
    this.transactionClient.release();
    this.transactionClient = null;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.transactionClient) {
      throw new Error('No transaction in progress');
    }
    
    await this.transactionClient.query('ROLLBACK');
    this.transactionClient.release();
    this.transactionClient = null;
  }

  isInTransaction(): boolean {
    return this.transactionClient !== null;
  }

  protected formatQuery(query: string, parameters?: unknown[]): string {
    if (!parameters || parameters.length === 0) {
      return query;
    }
    
    let formattedQuery = query;
    parameters.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      const value = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : String(param);
      formattedQuery = formattedQuery.replace(placeholder, value);
    });
    
    return formattedQuery;
  }

  protected handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(`PostgreSQL error: ${String(error)}`);
  }
}
