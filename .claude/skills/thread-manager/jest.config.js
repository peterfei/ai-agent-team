module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // Handle ESM imports with .js extension in source code
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Map specific MCP SDK paths to actual CJS files
    '^@modelcontextprotocol/sdk/server/mcp\\.js$': '<rootDir>/node_modules/@modelcontextprotocol/sdk/dist/cjs/server/mcp.js',
    '^@modelcontextprotocol/sdk/server/stdio\\.js$': '<rootDir>/node_modules/@modelcontextprotocol/sdk/dist/cjs/server/stdio.js',
    '^@modelcontextprotocol/sdk/types\\.js$': '<rootDir>/node_modules/@modelcontextprotocol/sdk/dist/cjs/types.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@modelcontextprotocol/sdk)/)'
  ],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};