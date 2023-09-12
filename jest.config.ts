import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    cache: false,
    verbose: true,
    testTimeout: 30000,
    setupFiles: ['dotenv/config'],
};

export default config;
