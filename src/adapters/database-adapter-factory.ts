import { DatabaseType, DatabaseConfig } from '../types/database.js';
import { BaseDatabaseAdapter } from './base-database-adapter.js';
import { PostgreSQLAdapter } from './postgresql-adapter.js';
import { MySQLAdapter } from './mysql-adapter.js';
import { SQLiteAdapter } from './sqlite-adapter.js';
import { RedisAdapter } from './redis-adapter.js';
import { MongoDBAdapter } from './mongodb-adapter.js';
import { CassandraAdapter } from './cassandra-adapter.js';
import { MSSQLAdapter } from './mssql-adapter.js';
import { DynamoDBAdapter } from './dynamodb-adapter.js';

export class DatabaseAdapterFactory {
  static createDatabase(config: DatabaseConfig): BaseDatabaseAdapter {
    switch (config.type) {
      case 'postgresql':
        return new PostgreSQLAdapter(config);
      case 'mysql':
        return new MySQLAdapter(config);
      case 'sqlite':
        return new SQLiteAdapter(config);
      case 'redis':
        return new RedisAdapter(config);
      case 'mongodb':
        return new MongoDBAdapter(config);
      case 'cassandra':
        return new CassandraAdapter(config);
      case 'mssql':
        return new MSSQLAdapter(config);
      case 'dynamodb':
        return new DynamoDBAdapter(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  static getSupportedTypes(): DatabaseType[] {
    return ['postgresql', 'mysql', 'sqlite', 'redis', 'mongodb', 'cassandra', 'mssql', 'dynamodb'];
  }

  static validateConfig(config: DatabaseConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('Database type is required');
    }

    if (!DatabaseAdapterFactory.getSupportedTypes().includes(config.type)) {
      errors.push(`Unsupported database type: ${config.type}`);
    }

    switch (config.type) {
      case 'postgresql':
      case 'mysql':
        if (!config.host && !config.url) {
          errors.push('Host or URL is required for PostgreSQL/MySQL');
        }
        if (!config.database && !config.url) {
          errors.push('Database name is required for PostgreSQL/MySQL');
        }
        break;
      case 'sqlite':
        if (!config.filename && !config.database && !config.url) {
          errors.push('Filename or database name is required for SQLite');
        }
        break;
      case 'redis':
        if (!config.host && !config.url) {
          errors.push('Host or URL is required for Redis');
        }
        break;
      case 'mongodb':
        if (!config.host && !config.url) {
          errors.push('Host or URL is required for MongoDB');
        }
        if (!config.database && !config.url) {
          errors.push('Database name is required for MongoDB');
        }
        break;
      case 'cassandra':
        if (!config.host && !config.url) {
          errors.push('Host or URL is required for Cassandra');
        }
        if (!config.keyspace && !config.database && !config.url) {
          errors.push('Keyspace or database name is required for Cassandra');
        }
        break;
      case 'mssql':
        if (!config.host && !config.url) {
          errors.push('Host or URL is required for Microsoft SQL Server');
        }
        if (!config.database && !config.url) {
          errors.push('Database name is required for Microsoft SQL Server');
        }
        break;
      case 'dynamodb':
        if (!config.region && !config.endpoint) {
          errors.push('Region or endpoint is required for DynamoDB');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static getDefaultConfig(type: DatabaseType): Partial<DatabaseConfig> {
    switch (type) {
      case 'postgresql':
        return { type: 'postgresql' };
      case 'mysql':
        return { type: 'mysql' };
      case 'sqlite':
        return { type: 'sqlite', filename: ':memory:' };
      case 'redis':
        return { type: 'redis' };
      case 'mongodb':
        return { type: 'mongodb' };
      case 'cassandra':
        return { type: 'cassandra' };
      case 'mssql':
        return { type: 'mssql' };
      case 'dynamodb':
        return { type: 'dynamodb', region: 'us-east-1' };
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}
