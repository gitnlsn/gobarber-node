module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    verbose: true,

    testPathIgnorePatterns: [
        '<rootDir>/src/__tests__', /* integration tests */
    ],

    collectCoverage: true,

    coverageDirectory: 'jestCoverage/unit/',
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
