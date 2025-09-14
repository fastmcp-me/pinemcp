import { MongoClient, Db } from 'mongodb';
import { BaseDatabaseAdapter } from './base-database-adapter.js';
import { QueryResult, TableInfo, DatabaseStats, ColumnInfo, IndexInfo } from '../types/database.js';

export class MongoDBAdapter extends BaseDatabaseAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private inTransaction: boolean = false;
  private session: any = null;

  async connect(): Promise<void> {
    try {
      const connectionString = this.config.url || 
        `mongodb://${this.config.username ? `${this.config.username}:${this.config.password}@` : ''}${this.config.host || 'localhost'}:${this.config.port || 27017}/${this.config.database || 'test'}`;

      const options: any = {};
      if (this.config.authSource) {
        options.authSource = this.config.authSource;
      }
      this.client = new MongoClient(connectionString, options);

      await this.client.connect();
      this.db = this.client.db(this.config.database || 'test');
      this.connected = true;
    } catch (error) {
      this.connected = false;
      throw this.handleError(error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.session) {
        await this.session.endSession();
        this.session = null;
      }
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
      }
      this.connected = false;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  isConnected(): boolean {
    return this.connected && this.client !== null && this.db !== null;
  }

  async executeQuery(query: string, _parameters?: unknown[]): Promise<QueryResult> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      // Parse MongoDB query (simplified JSON format)
      const queryObj = JSON.parse(query);
      const { collection, operation, filter, update, options } = queryObj;

      if (!collection || !operation) {
        throw new Error('Query must include collection and operation');
      }

      const coll = this.db.collection(collection);
      let result: unknown;

      switch (operation.toLowerCase()) {
        case 'find':
          result = await coll.find(filter || {}, options || {}).toArray();
          break;
        case 'findone':
          result = await coll.findOne(filter || {}, options || {});
          break;
        case 'insertone':
          result = await coll.insertOne(update || {});
          break;
        case 'insertmany':
          result = await coll.insertMany(Array.isArray(update) ? update : [update]);
          break;
        case 'updateone':
          result = await coll.updateOne(filter || {}, update || {}, options || {});
          break;
        case 'updatemany':
          result = await coll.updateMany(filter || {}, update || {}, options || {});
          break;
        case 'deleteone':
          result = await coll.deleteOne(filter || {}, options || {});
          break;
        case 'deletemany':
          result = await coll.deleteMany(filter || {}, options || {});
          break;
        case 'count':
          result = await coll.countDocuments(filter || {}, options || {});
          break;
        case 'distinct':
          result = await coll.distinct(update as string, filter || {}, options || {});
          break;
        case 'aggregate':
          result = await coll.aggregate(Array.isArray(update) ? update : [update], options || {}).toArray();
          break;
        default:
          throw new Error(`Unsupported MongoDB operation: ${operation}`);
      }

      const rows = Array.isArray(result) ? result : [result];
      
      return {
        rows: rows.map((row, index) => ({ _id: index, ...row })),
        rowCount: rows.length,
        fields: rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>).map(key => ({
          name: key,
          dataType: 'object',
          nullable: true,
          defaultValue: undefined,
        })) : [],
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const collections = await this.db.listCollections().toArray();
      const tables: TableInfo[] = [];

      for (const collection of collections) {
        const coll = this.db.collection(collection.name);
        
        // Get sample document to determine schema
        const sample = await coll.findOne({});
        const columns: ColumnInfo[] = [];

        if (sample) {
          Object.keys(sample).forEach(key => {
            columns.push({
              name: key,
              dataType: this.getMongoDBType(sample[key]),
              nullable: true,
              defaultValue: undefined,
              isPrimaryKey: key === '_id',
              isForeignKey: false,
            });
          });
        }

        // Get indexes
        const indexes = await coll.indexes();
        const indexInfos: IndexInfo[] = indexes.map(index => ({
          name: index.name || 'unnamed',
          columns: Object.keys(index.key),
          unique: index.unique || false,
          type: 'btree',
        }));

        tables.push({
          name: collection.name,
          type: 'table',
          columns,
          indexes: indexInfos,
          constraints: [],
        });
      }

      return tables;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTableInfo(tableName: string): Promise<TableInfo | null> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const coll = this.db.collection(tableName);
      
      // Get sample document
      const sample = await coll.findOne({});
      if (!sample) {
        return null;
      }

      const columns: ColumnInfo[] = Object.keys(sample).map(key => ({
        name: key,
        dataType: this.getMongoDBType(sample[key]),
        nullable: true,
        defaultValue: undefined,
        isPrimaryKey: key === '_id',
        isForeignKey: false,
      }));

      // Get indexes
      const indexes = await coll.indexes();
      const indexInfos: IndexInfo[] = indexes.map(index => ({
        name: index.name || 'unnamed',
        columns: Object.keys(index.key),
        unique: index.unique || false,
        type: 'btree',
      }));

      return {
        name: tableName,
        type: 'table',
        columns,
        indexes: indexInfos,
        constraints: [],
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const stats = await this.db.stats();
      const collections = await this.db.listCollections().toArray();
      
      return {
        totalTables: collections.length,
        totalViews: 0,
        totalIndexes: stats.indexes || 0,
        databaseSize: `${Math.round((stats.dataSize || 0) / 1024 / 1024 * 100) / 100} MB`,
        connectionCount: 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.db?.admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  async beginTransaction(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress');
    }
    
    if (!this.client) {
      throw new Error('Database not connected');
    }
    
    this.session = this.client.startSession();
    this.session.startTransaction();
    this.inTransaction = true;
  }

  async commitTransaction(): Promise<void> {
    if (!this.inTransaction || !this.session) {
      throw new Error('No transaction in progress');
    }
    
    await this.session.commitTransaction();
    await this.session.endSession();
    this.session = null;
    this.inTransaction = false;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.inTransaction || !this.session) {
      throw new Error('No transaction in progress');
    }
    
    await this.session.abortTransaction();
    await this.session.endSession();
    this.session = null;
    this.inTransaction = false;
  }

  isInTransaction(): boolean {
    return this.inTransaction;
  }

  private getMongoDBType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'unknown';
  }

  protected formatQuery(query: string, _parameters?: unknown[]): string {
    // MongoDB queries are JSON, so don't need parameter substitution
    return query;
  }

  protected handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(`MongoDB error: ${String(error)}`);
  }
}
