module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    verbose: true,

    testRegex: [
        '/__tests__/',
    ],

    maxConcurrency: 1,

    collectCoverage: true,

    coverageDirectory: 'jestCoverage/integrated/',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/database/migrations/**', /* ignore migrations only */
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
