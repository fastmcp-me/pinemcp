#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import chalk from 'chalk';
import { Configuration } from './core/configuration.js';
import { MCPServerService } from './services/mcp-server-service.js';
import { DatabaseAdapterFactory } from './adapters/database-adapter-factory.js';

const program = new Command();
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program
  .name('pinemcp')
  .description('A professional MCP server supporting multiple database types')
  .version(pkg.version);

program
  .command('start')
  .description('Start the MCP server')
  .action(async (_options) => {
    try {
      const config = Configuration.load();

      if (config.databases && config.databases.length > 0) {
        for (const db of config.databases) {
          const validation = DatabaseAdapterFactory.validateConfig(db);
          if (!validation.valid) {
            console.error(chalk.red(`Database configuration is invalid for ${db.name}:`));
            validation.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
            process.exit(1);
          }
        }
      } else {
        console.log(chalk.yellow('No database connections configured'));
        process.exit(1);
      }

      console.log(chalk.blue(`\nStarting PineMCP...`));
      console.log(chalk.gray(`Databases: ${config.databases?.length || 0} configured`));
      if (config.server.name && config.server.version) {
        console.log(chalk.gray(`Server: ${config.server.name} v${config.server.version}\n`));
      } else {
        console.log(chalk.gray(`Server: PineMCP\n`));
      }

      const server = new MCPServerService(config);
      
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\nShutting down server...'));
        await server.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        console.log(chalk.yellow('\nShutting down server...'));
        await server.stop();
        process.exit(0);
      });

      await server.start();
    } catch (error) {
      console.error(chalk.red(`Failed to start server: ${error}`));
      process.exit(1);
    }
  });

 

 

program
  .command('test-connections')
  .description('Test a database connection')
  .option('-n, --name <name>', 'Connection name to test')
  .action(async (options) => {
    try {
      const config = Configuration.load();

      const targets = options.name
        ? config.databases.filter(db => db.name === options.name)
        : config.databases;

      if (targets.length === 0) {
        console.error(chalk.red(options.name ? `Connection "${options.name}" not found` : 'No connections configured'));
        process.exit(1);
      }

      for (const connection of targets) {
        console.log(chalk.blue(`Testing Connection: ${connection.name} (${connection.type})\n`));

        const validation = DatabaseAdapterFactory.validateConfig(connection);
        if (!validation.valid) {
          console.error(chalk.red('Connection configuration is invalid:'));
          validation.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
          continue;
        }

        console.log(chalk.yellow('Testing connection...'));
        const adapter = DatabaseAdapterFactory.createDatabase(connection);
        try {
          await adapter.connect();
          const isValid = await adapter.validateConnection();
          if (isValid) {
            console.log(chalk.green('✓ Connection successful!'));
            try {
              const stats = await adapter.getDatabaseStats();
              console.log(chalk.gray(`Tables: ${stats.totalTables || 0}`));
              console.log(chalk.gray(`Views: ${stats.totalViews || 0}`));
              console.log(chalk.gray(`Indexes: ${stats.totalIndexes || 0}`));
              console.log(chalk.gray(`Database Size: ${stats.databaseSize || 'N/A'}`));
            } catch {
              console.log(chalk.gray('Could not retrieve database info'));
            }
          } else {
            console.log(chalk.red('✗ Connection failed'));
          }
        } catch (error) {
          console.log(chalk.red(`✗ Connection failed: ${error}`));
        } finally {
          await adapter.disconnect();
        }
        console.log();
      }
    } catch (error) {
      console.error(chalk.red(`Failed to test connection: ${error}`));
      process.exit(1);
    }
  });

 

program.on('command:*', () => {
  console.error(chalk.red(`Unknown command: ${program.args.join(' ')}`));
  console.log(chalk.gray('Use --help to see available commands.'));
  process.exit(1);
});

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
