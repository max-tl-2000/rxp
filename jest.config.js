/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
module.exports = {
  preset: 'jest-expo',
  collectCoverage: true,
  coverageReporters: ['lcov', 'json-summary'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|jest-expo|react-clone-referenced-element|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)',
  ],
  testPathIgnorePatterns: ['backend/', 'backend-dist/', '__tests__/e2e/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
