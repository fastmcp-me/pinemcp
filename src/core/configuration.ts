import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MCPConfig } from '../types/mcp.js';
import { DatabaseConfig } from '../types/database.js';
import { DatabaseAdapterFactory } from '../adapters/database-adapter-factory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Configuration {
  private static readonly CONFIG_PATH = join(__dirname, '../../config/mcp-config.json');
  private static readonly DEFAULT_CONFIG_PATH = join(__dirname, '../../config/mcp-config.default.json');

  /**
   * Load configuration from file or create default
   */
  static load(): MCPConfig {
    try {
      if (existsSync(this.CONFIG_PATH)) {
        const configData = readFileSync(this.CONFIG_PATH, 'utf-8');
        const parsed = JSON.parse(configData);
        return MCPConfig.parse(parsed);
      } else if (existsSync(this.DEFAULT_CONFIG_PATH)) {
        const configData = readFileSync(this.DEFAULT_CONFIG_PATH, 'utf-8');
        const parsed = JSON.parse(configData);
        return MCPConfig.parse(parsed);
      } else {
        return this.createDefault();
      }
    } catch (error) {
      console.warn('Failed to load configuration, using defaults:', error);
      return this.createDefault();
    }
  }

  /**
   * Save configuration to file
   */
  static save(config: MCPConfig): void {
    try {
      const configDir = dirname(this.CONFIG_PATH);
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
      writeFileSync(this.CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  /**
   * Create default configuration
   */
  static createDefault(): MCPConfig {
    return {
      databases: [
        {
          name: 'default',
          type: 'sqlite',
          filename: ':memory:',
        }
      ],
      server: {
        name: 'MCP MultiDB Server',
        version: '1.0.0',
        description: 'A professional MCP server supporting multiple database types',
        port: 3000,
        host: 'localhost',
      },
      logging: {
        level: 'info',
        format: 'text',
      },
    };
  }

  /**
   * Validate database configuration
   */
  static validateDatabaseConfig(config: DatabaseConfig): { valid: boolean; errors: string[] } {
    return DatabaseAdapterFactory.validateConfig(config);
  }

  /**
   * Parse database URL into configuration
   */
  static parseDatabaseUrl(url: string): DatabaseConfig | null {
    try {
      const parsedUrl = new URL(url);
      
      switch (parsedUrl.protocol) {
        case 'postgresql:':
        case 'postgres:':
          return {
            type: 'postgresql',
            host: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : 5432,
            database: parsedUrl.pathname.slice(1),
            username: parsedUrl.username,
            password: parsedUrl.password,
            ssl: parsedUrl.searchParams.get('sslmode') === 'require',
          };
        case 'mysql:':
          return {
            type: 'mysql',
            host: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : 3306,
            database: parsedUrl.pathname.slice(1),
            username: parsedUrl.username,
            password: parsedUrl.password,
            ssl: parsedUrl.searchParams.get('ssl') === 'true',
          };
        case 'sqlite:':
          return {
            type: 'sqlite',
            filename: parsedUrl.pathname,
          };
        case 'redis:':
          return {
            type: 'redis',
            host: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : 6379,
            db: parsedUrl.pathname.slice(1) ? parseInt(parsedUrl.pathname.slice(1)) : 0,
            password: parsedUrl.password,
          };
        case 'mongodb:':
          return {
            type: 'mongodb',
            host: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : 27017,
            database: parsedUrl.pathname.slice(1),
            username: parsedUrl.username,
            password: parsedUrl.password,
            authSource: parsedUrl.searchParams.get('authSource') || undefined,
          };
        case 'cassandra:':
          return {
            type: 'cassandra',
            host: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : 9042,
            keyspace: parsedUrl.pathname.slice(1),
            username: parsedUrl.username,
            password: parsedUrl.password,
            datacenter: parsedUrl.searchParams.get('datacenter') || 'datacenter1',
          };
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Interactive setup wizard
   */
  static async setupInteractive(): Promise<MCPConfig> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (query: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, resolve);
      });
    };

    try {
        console.log('PineMCP Setup');
      console.log('========================\n');

      const databases: Array<{ name: string; type: 'postgresql' | 'mysql' | 'sqlite' | 'redis' | 'mongodb' | 'cassandra'; [key: string]: any }> = [];
      let connectionCount = 1;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        console.log(`\nDatabase Connection ${connectionCount}`);
        console.log('=====================================');
        
        const connName = await question(`Connection name (e.g., main-db, redis-cache, mongo-docs): `);
        if (!connName.trim()) break;

        console.log('\nSupported database types:');
        console.log('1. PostgreSQL');
        console.log('2. MySQL');
        console.log('3. SQLite');
        console.log('4. Redis');
        console.log('5. MongoDB');
        console.log('6. Cassandra');
        
        const dbTypeChoice = await question('Select database type (1-6): ');
        let dbType: 'postgresql' | 'mysql' | 'sqlite' | 'redis' | 'mongodb' | 'cassandra';
        
        switch (dbTypeChoice) {
          case '1': dbType = 'postgresql'; break;
          case '2': dbType = 'mysql'; break;
          case '3': dbType = 'sqlite'; break;
          case '4': dbType = 'redis'; break;
          case '5': dbType = 'mongodb'; break;
          case '6': dbType = 'cassandra'; break;
          default:
            console.log('Invalid choice, skipping this connection');
            continue;
        }

        const databaseConfig: { name: string; type: 'postgresql' | 'mysql' | 'sqlite' | 'redis' | 'mongodb' | 'cassandra'; [key: string]: any } = {
          name: connName,
          type: dbType,
        };

        if (dbType === 'sqlite') {
          const filename = await question('SQLite database file path (or :memory: for in-memory): ');
          databaseConfig.filename = filename || ':memory:';
        } else {
          const host = await question(`Database host (default: localhost): `);
          const port = await question(`Database port (default: ${this.getDefaultPort(dbType)}): `);
          const database = await question(`Database name${dbType === 'cassandra' ? '/keyspace' : ''}: `);
          
          let username: string;
          let password: string;
          
          if (dbType === 'redis') {
            username = await question('Username (optional, press Enter to skip): ');
            password = await question('Password (optional, press Enter to skip): ');
          } else {
            username = await question('Username: ');
            password = await question('Password: ');
            
            if (!username.trim()) {
              console.log('Username is required for this database type, skipping this connection');
              continue;
            }
          }
          
          const ssl = await question('Use SSL? (y/N): ');

          databaseConfig.host = host || 'localhost';
          databaseConfig.port = port ? parseInt(port) : this.getDefaultPort(dbType);
          databaseConfig.database = database || '';
          databaseConfig.username = username.trim() || undefined;
          databaseConfig.password = password.trim() || undefined;
          databaseConfig.ssl = ssl.toLowerCase() === 'y' || ssl.toLowerCase() === 'yes';

          if (dbType === 'redis') {
            const db = await question('Redis database number (default: 0): ');
            databaseConfig.db = db ? parseInt(db) : 0;
          } else if (dbType === 'mongodb') {
            const authSource = await question('MongoDB auth source (optional): ');
            if (authSource) databaseConfig.authSource = authSource;
          } else if (dbType === 'cassandra') {
            const datacenter = await question('Cassandra datacenter (default: datacenter1): ');
            databaseConfig.datacenter = datacenter || 'datacenter1';
          }
        }

        databases.push(databaseConfig);
        connectionCount++;

        const addAnother = await question('\nAdd another database connection? (y/N): ');
        if (addAnother.toLowerCase() !== 'y' && addAnother.toLowerCase() !== 'yes') {
          break;
        }
      }

      const logLevel = await question('\nLog level (error/warn/info/debug, default: info): ');

      const config: MCPConfig = {
        databases: databases,
        server: {
          name: 'PineMCP',
          version: '1.0.0',
          description: 'A professional MCP server supporting multiple database types',
          port: 3000, // Not used for MCP, but kept for compatibility
          host: 'localhost', // Not used for MCP, but kept for compatibility
        },
        logging: {
          level: (logLevel as any) || 'info',
          format: 'text',
        },
      };

      for (const db of databases) {
        const validation = this.validateDatabaseConfig(db);
        if (!validation.valid) {
          console.error(`Configuration validation failed for ${db.name}:`);
          validation.errors.forEach(error => console.error(`  - ${error}`));
          throw new Error(`Invalid configuration for ${db.name}`);
        }
      }

      console.log('\nConfiguration saved successfully!');
      console.log(`Configured ${databases.length} database connection(s):`);
      databases.forEach(db => console.log(`  - ${db.name} (${db.type})`));
      
      return config;

    } finally {
      rl.close();
    }
  }

  private static getDefaultPort(type: string): number {
    switch (type) {
      case 'postgresql': return 5432;
      case 'mysql': return 3306;
      case 'redis': return 6379;
      case 'mongodb': return 27017;
      case 'cassandra': return 9042;
      default: return 3000;
    }
  }

  static reset(): void {
    const defaultConfig: MCPConfig = {
      databases: [],
      server: {
        name: 'PineMCP',
        version: '1.0.0',
        description: 'A professional MCP server supporting multiple database types',
        port: 3000,
        host: 'localhost',
      },
      logging: {
        level: 'info',
        format: 'text',
      },
    };

    this.save(defaultConfig);
  }

  static async addConnectionInteractive(): Promise<any> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, resolve);
      });
    };

    try {
      console.log('Add New Database Connection');
      console.log('===========================\n');

      const dbTypes = ['postgresql', 'mysql', 'sqlite', 'redis', 'mongodb', 'cassandra'];
      console.log('Supported database types:');
      dbTypes.forEach((type, index) => {
        console.log(`${index + 1}. ${type.charAt(0).toUpperCase() + type.slice(1)}`);
      });

      const typeChoice = await question('\nSelect database type (1-6): ');
      const typeIndex = parseInt(typeChoice) - 1;
      
      if (typeIndex < 0 || typeIndex >= dbTypes.length) {
        throw new Error('Invalid database type selection');
      }

      const dbType = dbTypes[typeIndex] as 'postgresql' | 'mysql' | 'sqlite' | 'redis' | 'mongodb' | 'cassandra';
      const name = await question('Connection name: ');

      if (!name.trim()) {
        throw new Error('Connection name is required');
      }

      const databaseConfig: any = {
        name: name.trim(),
        type: dbType,
      };

      if (dbType === 'sqlite') {
        const filename = await question('SQLite database file path (or :memory: for in-memory): ');
        databaseConfig.filename = filename || ':memory:';
      } else {
        const host = await question(`Database host (default: localhost): `);
        const port = await question(`Database port (default: ${this.getDefaultPort(dbType)}): `);
        const database = await question(`Database name${dbType === 'cassandra' ? '/keyspace' : ''}: `);
        
        let username: string;
        let password: string;
        
        if (dbType === 'redis') {
          username = await question('Username (optional, press Enter to skip): ');
          password = await question('Password (optional, press Enter to skip): ');
        } else {
          username = await question('Username: ');
          password = await question('Password: ');
          
          if (!username.trim()) {
            throw new Error('Username is required for this database type');
          }
        }

        const ssl = await question('Use SSL? (y/N): ');

        databaseConfig.host = host || 'localhost';
        databaseConfig.port = port ? parseInt(port) : this.getDefaultPort(dbType);
        databaseConfig.database = database || '';
        databaseConfig.username = username.trim() || undefined;
        databaseConfig.password = password.trim() || undefined;
        databaseConfig.ssl = ssl.toLowerCase() === 'y' || ssl.toLowerCase() === 'yes';

        if (dbType === 'redis') {
          const db = await question('Redis database number (default: 0): ');
          databaseConfig.db = db ? parseInt(db) : 0;
        } else if (dbType === 'mongodb') {
          const authSource = await question('MongoDB auth source (optional): ');
          if (authSource) databaseConfig.authSource = authSource;
        } else if (dbType === 'cassandra') {
          const datacenter = await question('Cassandra datacenter (optional): ');
          if (datacenter) databaseConfig.datacenter = datacenter;
        }
      }

      return databaseConfig;
    } finally {
      rl.close();
    }
  }

  static async editConnectionInteractive(existingConnection: any): Promise<any> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query: string, defaultValue?: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, (answer) => {
          resolve(answer || defaultValue || '');
        });
      });
    };

    try {
      console.log('Edit Database Connection');
      console.log('========================\n');

      const name = await question(`Connection name (current: ${existingConnection.name}): `, existingConnection.name);
      const dbType = existingConnection.type;

      const databaseConfig: any = {
        name: name.trim() || existingConnection.name,
        type: dbType,
      };

      if (dbType === 'sqlite') {
        const filename = await question(`SQLite database file path (current: ${existingConnection.filename}): `, existingConnection.filename);
        databaseConfig.filename = filename || existingConnection.filename;
      } else {
        const host = await question(`Database host (current: ${existingConnection.host}): `, existingConnection.host);
        const port = await question(`Database port (current: ${existingConnection.port}): `, existingConnection.port?.toString());
        const database = await question(`Database name (current: ${existingConnection.database}): `, existingConnection.database);
        
        let username: string;
        let password: string;
        
        if (dbType === 'redis') {
          username = await question(`Username (current: ${existingConnection.username || 'none'}): `, existingConnection.username);
          password = await question(`Password (current: ${existingConnection.password ? '***' : 'none'}): `, existingConnection.password);
        } else {
          username = await question(`Username (current: ${existingConnection.username}): `, existingConnection.username);
          password = await question(`Password (current: ${existingConnection.password ? '***' : 'none'}): `, existingConnection.password);
          
          if (!username.trim()) {
            throw new Error('Username is required for this database type');
          }
        }

        const ssl = await question(`Use SSL? (current: ${existingConnection.ssl ? 'y' : 'n'}) (y/N): `, existingConnection.ssl ? 'y' : 'n');

        databaseConfig.host = host || existingConnection.host;
        databaseConfig.port = port ? parseInt(port) : existingConnection.port;
        databaseConfig.database = database || existingConnection.database;
        databaseConfig.username = username.trim() || existingConnection.username;
        databaseConfig.password = password.trim() || existingConnection.password;
        databaseConfig.ssl = ssl.toLowerCase() === 'y' || ssl.toLowerCase() === 'yes';

        if (dbType === 'redis') {
          const db = await question(`Redis database number (current: ${existingConnection.db}) (default: 0): `, existingConnection.db?.toString());
          databaseConfig.db = db ? parseInt(db) : existingConnection.db;
        } else if (dbType === 'mongodb') {
          const authSource = await question(`MongoDB auth source (current: ${existingConnection.authSource || 'none'}): `, existingConnection.authSource);
          if (authSource) databaseConfig.authSource = authSource;
        } else if (dbType === 'cassandra') {
          const datacenter = await question(`Cassandra datacenter (current: ${existingConnection.datacenter || 'none'}): `, existingConnection.datacenter);
          if (datacenter) databaseConfig.datacenter = datacenter;
        }
      }

      return databaseConfig;
    } finally {
      rl.close();
    }
  }
}
