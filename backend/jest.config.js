// eslint-disable-file
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/src/database/',
    '/src/adapters/',
    '/src/model/',
    '/src/server.ts',
    '/src/controller/',
    '/src/utils/stopwatch.utils.ts',
  ]
};