module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/database/migrations/**',
        '!<rootDir>/src/**/index.ts',
    ],
    coverageReporters: [
        'text-summary',
        'lcov',
    ],
};
