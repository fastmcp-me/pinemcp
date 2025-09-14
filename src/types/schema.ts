import { z } from 'zod';

// Schema comparison types
export const SchemaComparisonResult = z.object({
  identical: z.boolean(),
  differences: z.array(z.object({
    type: z.enum(['table_added', 'table_removed', 'table_modified', 'column_added', 'column_removed', 'column_modified', 'index_added', 'index_removed', 'index_modified', 'constraint_added', 'constraint_removed', 'constraint_modified']),
    tableName: z.string(),
    columnName: z.string().optional(),
    details: z.string(),
    sourceValue: z.any().optional(),
    targetValue: z.any().optional(),
  })),
  summary: z.object({
    tablesAdded: z.number(),
    tablesRemoved: z.number(),
    tablesModified: z.number(),
    columnsAdded: z.number(),
    columnsRemoved: z.number(),
    columnsModified: z.number(),
  }),
});

export type SchemaComparisonResult = z.infer<typeof SchemaComparisonResult>;

// Migration types
export const MigrationStep = z.object({
  id: z.string(),
  type: z.enum(['create_table', 'drop_table', 'add_column', 'drop_column', 'modify_column', 'add_index', 'drop_index', 'add_constraint', 'drop_constraint']),
  tableName: z.string(),
  columnName: z.string().optional(),
  sql: z.string(),
  rollbackSql: z.string(),
  description: z.string(),
});

export type MigrationStep = z.infer<typeof MigrationStep>;

export const Migration = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  timestamp: z.string(),
  steps: z.array(MigrationStep),
  sourceConnection: z.string(),
  targetConnection: z.string(),
});

export type Migration = z.infer<typeof Migration>;

// DDL generation types
export const DDLGenerationOptions = z.object({
  includeData: z.boolean().default(false),
  includeIndexes: z.boolean().default(true),
  includeConstraints: z.boolean().default(true),
  includeViews: z.boolean().default(true),
  includeFunctions: z.boolean().default(false),
  includeTriggers: z.boolean().default(false),
  format: z.enum(['sql', 'json', 'yaml']).default('sql'),
});

export type DDLGenerationOptions = z.infer<typeof DDLGenerationOptions>;

// Data export/import types
export const ExportOptions = z.object({
  format: z.enum(['json', 'csv', 'sql', 'xml']),
  tables: z.array(z.string()).optional(),
  whereClause: z.string().optional(),
  limit: z.number().optional(),
  includeSchema: z.boolean().default(true),
  prettyPrint: z.boolean().default(false),
});

export type ExportOptions = z.infer<typeof ExportOptions>;

export const ImportOptions = z.object({
  format: z.enum(['json', 'csv', 'sql', 'xml']),
  tableName: z.string(),
  mode: z.enum(['insert', 'upsert', 'replace']).default('insert'),
  batchSize: z.number().default(1000),
  skipErrors: z.boolean().default(false),
  mapping: z.record(z.string()).optional(), // column mapping
});

export type ImportOptions = z.infer<typeof ImportOptions>;

// Query analysis types
export const QueryAnalysisResult = z.object({
  query: z.string(),
  executionTime: z.number(),
  rowsAffected: z.number(),
  executionPlan: z.any().optional(),
  performance: z.object({
    slow: z.boolean(),
    score: z.number(), // 0-100 performance score
    recommendations: z.array(z.string()),
  }),
  resources: z.object({
    cpuUsage: z.number().optional(),
    memoryUsage: z.number().optional(),
    diskReads: z.number().optional(),
    diskWrites: z.number().optional(),
  }).optional(),
});

export type QueryAnalysisResult = z.infer<typeof QueryAnalysisResult>;

export const QueryTemplate = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  query: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    defaultValue: z.any().optional(),
  })),
  tags: z.array(z.string()),
  connectionType: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type QueryTemplate = z.infer<typeof QueryTemplate>;
