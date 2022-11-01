/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { createMockHelper } from '../../../../resources/test-helpers/mockModules';
/* eslint-disable global-require */
const { mockModules } = createMockHelper(jest);

describe('ignoreBot test', () => {
  let ignoreBot;
  beforeEach(() => {
    mockModules({
      '../../browser-detector': {
        isRequestFromABot: () => true,
      },
    });

    ignoreBot = require('../ignoreBot').ignoreBot;
  });

  it('should ignore requests coming from ', () => {
    const nextSpy = jest.fn();
    const resMock = {
      set: jest.fn(),
      end: jest.fn(),
      status: jest.fn(),
    };
    ignoreBot({}, resMock, nextSpy);
    expect(nextSpy).not.toHaveBeenCalled();
    expect(resMock.set).toHaveBeenCalledWith('X-Robots-Tag', 'noindex, nofollow');
    expect(resMock.end).toHaveBeenCalled();
    expect(resMock.status).toHaveBeenCalledWith(200);
  });
});
