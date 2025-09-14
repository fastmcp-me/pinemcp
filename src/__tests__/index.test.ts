import { describe, it, expect } from '@jest/globals';

describe('PineMCP', () => {
  it('should have a valid package name', () => {
    const packageJson = require('../../package.json');
    expect(packageJson.name).toBe('pinemcp');
  });

  it('should have required scripts', () => {
    const packageJson = require('../../package.json');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('test');
  });

  it('should have required dependencies', () => {
    const packageJson = require('../../package.json');
    expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
    expect(packageJson.dependencies).toHaveProperty('commander');
    expect(packageJson.dependencies).toHaveProperty('chalk');
  });

  it('should have proper bin configuration', () => {
    const packageJson = require('../../package.json');
    expect(packageJson.bin).toHaveProperty('pinemcp');
    expect(packageJson.bin.pinemcp).toBe('dist/index.js');
  });
});
