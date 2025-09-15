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
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--setup', 'Run interactive setup')
  .action(async (options) => {
    try {
      let config;
      
      if (options.setup) {
        console.log(chalk.blue('Running interactive setup...\n'));
        config = await Configuration.setupInteractive();
        Configuration.save(config);
        console.log(chalk.green('Configuration saved successfully!\n'));
      } else {
        config = Configuration.load();
      }

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
      console.log(chalk.gray(`Server: ${config.server.name} v${config.server.version}\n`));

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
  .command('setup')
  .description('Run interactive setup to configure the server')
  .action(async () => {
    try {
      console.log(chalk.blue('PineMCP Setup\n'));
      const config = await Configuration.setupInteractive();
      Configuration.save(config);
      console.log(chalk.green('\nSetup completed successfully!'));
      console.log(chalk.gray('Run "pinemcp start" to start the server.'));
    } catch (error) {
      console.error(chalk.red(`Setup failed: ${error}`));
      process.exit(1);
    }
  });


program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    try {
      const config = Configuration.load();
      console.log(chalk.blue('Current Configuration:\n'));
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      console.error(chalk.red(`Failed to load config: ${error}`));
      process.exit(1);
    }
  });

program
  .command('connections')
  .description('Manage database connections')
  .action(async () => {
    try {
      const config = Configuration.load();
      if (!config.databases || config.databases.length === 0) {
        console.log(chalk.yellow('No database connections configured'));
        console.log(chalk.gray('Run "pinemcp setup" to add connections'));
        return;
      }

      console.log(chalk.blue('\nDatabase Connections:'));
      console.log(chalk.blue('===================\n'));
      
      config.databases.forEach((db, index) => {
        console.log(chalk.green(`${index + 1}. ${db.name}`));
        console.log(chalk.gray(`   Type: ${db.type}`));
        console.log(chalk.gray(`   Host: ${db.host || 'N/A'}`));
        console.log(chalk.gray(`   Database: ${db.database || 'N/A'}`));
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red(`Failed to load connections: ${error}`));
      process.exit(1);
    }
  });

program
  .command('add-connection')
  .description('Add a new database connection')
  .action(async () => {
    try {
      console.log(chalk.blue('Add New Database Connection\n'));
      const config = Configuration.load();
      
      const newConnection = await Configuration.addConnectionInteractive();
      config.databases.push(newConnection);
      
      Configuration.save(config);
      console.log(chalk.green(`\nConnection "${newConnection.name}" added successfully!`));
    } catch (error) {
      console.error(chalk.red(`Failed to add connection: ${error}`));
      process.exit(1);
    }
  });

program
  .command('edit-connection')
  .description('Edit an existing database connection')
  .option('-n, --name <name>', 'Connection name to edit')
  .action(async (options) => {
    try {
      if (!options.name) {
        console.error(chalk.red('Please specify a connection name with -n or --name'));
        process.exit(1);
      }

      console.log(chalk.blue(`Edit Connection: ${options.name}\n`));
      const config = Configuration.load();
      
      const connectionIndex = config.databases.findIndex(db => db.name === options.name);
      if (connectionIndex === -1) {
        console.error(chalk.red(`Connection "${options.name}" not found`));
        process.exit(1);
      }

      const updatedConnection = await Configuration.editConnectionInteractive(config.databases[connectionIndex]);
      config.databases[connectionIndex] = updatedConnection;
      
      Configuration.save(config);
      console.log(chalk.green(`\nConnection "${options.name}" updated successfully!`));
    } catch (error) {
      console.error(chalk.red(`Failed to edit connection: ${error}`));
      process.exit(1);
    }
  });

program
  .command('remove-connection')
  .description('Remove a database connection')
  .option('-n, --name <name>', 'Connection name to remove')
  .action(async (options) => {
    try {
      if (!options.name) {
        console.error(chalk.red('Please specify a connection name with -n or --name'));
        process.exit(1);
      }

      const config = Configuration.load();
      const connectionIndex = config.databases.findIndex(db => db.name === options.name);
      if (connectionIndex === -1) {
        console.error(chalk.red(`Connection "${options.name}" not found`));
        process.exit(1);
      }

      const connection = config.databases[connectionIndex];
      if (!connection) {
        console.error(chalk.red(`Connection "${options.name}" not found`));
        process.exit(1);
      }
      
      console.log(chalk.yellow(`\nAre you sure you want to remove connection "${options.name}"?`));
      console.log(chalk.gray(`Type: ${connection.type}`));
      console.log(chalk.gray(`Host: ${connection.host || 'N/A'}`));
      console.log(chalk.gray(`Database: ${connection.database || 'N/A'}`));
      console.log(chalk.red('\nThis action cannot be undone!'));
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const confirm = await new Promise<string>((resolve) => {
        rl.question('\nType "yes" to confirm: ', resolve);
      });
      rl.close();

      if (confirm.toLowerCase() !== 'yes') {
        console.log(chalk.gray('Operation cancelled'));
        return;
      }

      config.databases.splice(connectionIndex, 1);
      Configuration.save(config);
      console.log(chalk.green(`\nConnection "${options.name}" removed successfully!`));
    } catch (error) {
      console.error(chalk.red(`Failed to remove connection: ${error}`));
      process.exit(1);
    }
  });

program
  .command('test-connection')
  .description('Test a database connection')
  .option('-n, --name <name>', 'Connection name to test')
  .action(async (options) => {
    try {
      if (!options.name) {
        console.error(chalk.red('Please specify a connection name with -n or --name'));
        process.exit(1);
      }

      console.log(chalk.blue(`Testing Connection: ${options.name}\n`));
      const config = Configuration.load();
      
      const connection = config.databases.find(db => db.name === options.name);
      if (!connection) {
        console.error(chalk.red(`Connection "${options.name}" not found`));
        process.exit(1);
      }

      const validation = DatabaseAdapterFactory.validateConfig(connection);
      if (!validation.valid) {
        console.error(chalk.red('Connection configuration is invalid:'));
        validation.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      console.log(chalk.yellow('Testing connection...'));
      const adapter = DatabaseAdapterFactory.createDatabase(connection);
      
      try {
        await adapter.connect();
        const isValid = await adapter.validateConnection();
        
        if (isValid) {
          console.log(chalk.green('✓ Connection successful!'));
          
          // Get some basic info
          try {
            const stats = await adapter.getDatabaseStats();
            console.log(chalk.gray(`Tables: ${stats.totalTables || 0}`));
            console.log(chalk.gray(`Views: ${stats.totalViews || 0}`));
            console.log(chalk.gray(`Indexes: ${stats.totalIndexes || 0}`));
            console.log(chalk.gray(`Database Size: ${stats.databaseSize || 'N/A'}`));
          } catch (infoError) {
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
    } catch (error) {
      console.error(chalk.red(`Failed to test connection: ${error}`));
      process.exit(1);
    }
  });

program
  .command('reset-config')
  .description('Reset configuration to defaults')
  .action(async () => {
    try {
      console.log(chalk.yellow('\nAre you sure you want to reset the configuration?'));
      console.log(chalk.red('This will remove all database connections and cannot be undone!'));
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const confirm = await new Promise<string>((resolve) => {
        rl.question('\nType "yes" to confirm: ', resolve);
      });
      rl.close();

      if (confirm.toLowerCase() !== 'yes') {
        console.log(chalk.gray('Operation cancelled'));
        return;
      }

      Configuration.reset();
      console.log(chalk.green('\nConfiguration reset successfully!'));
      console.log(chalk.gray('Run "pinemcp setup" to configure new connections'));
    } catch (error) {
      console.error(chalk.red(`Failed to reset configuration: ${error}`));
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
