import { z } from 'zod';

export const DatabaseType = z.enum(['postgresql', 'mysql', 'sqlite', 'redis', 'mongodb', 'cassandra', 'mssql', 'dynamodb']);
export type DatabaseType = z.infer<typeof DatabaseType>;

export const DatabaseConfig = z.object({
  type: DatabaseType,
  url: z.string().url().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  ssl: z.boolean().optional(),
  filename: z.string().optional(),
  db: z.number().optional(),
  authSource: z.string().optional(),
  keyspace: z.string().optional(),
  datacenter: z.string().optional(),
  instanceName: z.string().optional(),
  trustServerCertificate: z.boolean().optional(),
  region: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  endpoint: z.string().optional(),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfig>;

export interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  fields: FieldInfo[];
}

export interface FieldInfo {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: unknown;
}

export interface TableInfo {
  name: string;
  schema?: string;
  type: 'table' | 'view' | 'materialized_view';
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: unknown;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  maxLength?: number | undefined;
  precision?: number | undefined;
  scale?: number | undefined;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

export interface ConstraintInfo {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK' | 'NOT NULL';
  columns: string[];
  referencedTable?: string | undefined;
  referencedColumns?: string[] | undefined;
}

export interface DatabaseOperation {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER';
  query: string;
  parameters?: unknown[];
}

export interface DatabaseStats {
  totalTables: number;
  totalViews: number;
  totalIndexes: number;
  databaseSize: string;
  connectionCount: number;
}
