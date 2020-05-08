module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    verbose: true,
    maxConcurrency: 1, /* integrated tests will touch the database */
    collectCoverage: true,

    coverageDirectory: 'jestCoverage/overall/',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/database/**', /* ignore database */
        '!<rootDir>/src/**/index.ts', /* ignore index files */
        '!<rootDir>/src/server.ts', /* ignore server */
        '!<rootDir>/src/**/*.test.ts', /* ignore test files */
        '!<rootDir>/src/**/*.spec.ts', /* ignore test files */
    ],
    coverageReporters: [
        'text-summary',
        'lcov',
    ],
};
